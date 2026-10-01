# Deploying to Google Cloud (Cloud Run + VM)

Four pieces:
- **MongoDB** — on a Compute Engine VM you create yourself
- **Backend API** — Cloud Run service, built from `server/Dockerfile`
- **Frontend** — Cloud Run service, built from `Dockerfile` (root)
- **Admin console** — the same frontend codebase built in a different mode (`VITE_APP_MODE=admin`), as its own Cloud Run service, talking to the same backend and the same database — locked down with Identity-Aware Proxy so only your Google account can open it (step 7)

Android is out of scope for this guide — browser only, per your current setup.

Run everything below from the project root unless noted. Replace `YOUR_PROJECT_ID` and `REGION` (e.g. `asia-south1` for Mumbai) throughout.

```
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com compute.googleapis.com vpcaccess.googleapis.com iap.googleapis.com
```

## 1. MongoDB on your VM

Cloud Run is serverless and has no fixed network location, so it can't reach a VM's private IP directly — it needs a **Serverless VPC Access connector** bridging into your VM's VPC. This keeps MongoDB off the public internet entirely (more secure than exposing it on the VM's external IP).

**On the VM** (Debian/Ubuntu example):
```bash
# SSH into your VM, then:
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod
```

Bind MongoDB to the VM's internal IP (not just localhost) and enable auth, in `/etc/mongod.conf`:
```yaml
net:
  port: 27017
  bindIp: 127.0.0.1,<VM_INTERNAL_IP>   # find with: hostname -I
security:
  authorization: enabled
```

Create an app user (connect via `mongosh` first):
```js
use homeserv
db.createUser({ user: "homeserv", pwd: "CHOOSE_A_STRONG_PASSWORD", roles: [{ role: "readWrite", db: "homeserv" }] })
```

Restart: `sudo systemctl restart mongod`

**Firewall** — allow only internal VPC traffic to port 27017 (no public exposure):
```bash
gcloud compute firewall-rules create allow-mongo-internal \
  --network=default \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:27017 \
  --source-ranges=10.8.0.0/28   # the VPC connector range created in step 2
```

## 2. Serverless VPC Access connector (so Cloud Run can reach the VM)

```bash
gcloud compute networks vpc-access connectors create homeserv-connector \
  --region=REGION \
  --network=default \
  --range=10.8.0.0/28
```

## 3. Build and push the backend image

Create the Artifact Registry repo once:
```bash
gcloud artifacts repositories create narasimha8780 --repository-format=docker --location=REGION
```

Both services build via a `cloudbuild-*.yaml` (same pattern: pull the previous `:latest` as a build cache, build + tag with `$BRANCH_NAME:$COMMIT_SHA`, push both tags, then deploy). These are written to work either as a one-off manual build or wired to a Cloud Build **trigger** on git push — see the note at the end of this section.

Manual build + push (`$BRANCH_NAME`/`$COMMIT_SHA` are normally filled in automatically by a trigger; when running manually with `gcloud builds submit` you supply them yourself):
```bash
gcloud builds submit --config=server/cloudbuild-api.yaml \
  --substitutions=_REGION=REGION,_SERVICE_NAME=homeserv-api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)
```

This already deploys the backend to Cloud Run as its last step — but the **first deploy** needs the VPC connector and `MONGODB_URI` attached, which the trigger config intentionally leaves alone (so CI never touches secrets). Run this once, by hand, right after the first build above:
```bash
gcloud run services update homeserv-api \
  --region=REGION \
  --vpc-connector=homeserv-connector \
  --vpc-egress=private-ranges-only \
  --set-env-vars="MONGODB_URI=mongodb://homeserv:CHOOSE_A_STRONG_PASSWORD@<VM_INTERNAL_IP>:27017/homeserv?authSource=homeserv"
```
After that, every subsequent build/deploy (manual or via trigger) keeps this configuration — `gcloud run deploy` only changes what you explicitly pass, so the VPC connector and env vars stick around.

Note the service URL it prints, e.g. `https://homeserv-api-xxxxx-REGION.a.run.app`. Confirm it works:
```bash
curl https://homeserv-api-xxxxx-REGION.a.run.app/api/health
```

**Seed the database once**, without ever exposing MongoDB to the public internet — tunnel through SSH instead:
```bash
gcloud compute ssh YOUR_VM_NAME --zone=YOUR_ZONE -- -L 27017:localhost:27017 -N &
```
Then, from your machine, in `server/.env`, temporarily point at the tunnel and run the seed script:
```bash
MONGODB_URI="mongodb://homeserv:CHOOSE_A_STRONG_PASSWORD@localhost:27017/homeserv?authSource=homeserv" npm run server:seed
```
Kill the tunnel (`fg` then Ctrl+C, or `kill %1`) when done.

## 4. Build and deploy the frontend

Vite bakes `VITE_API_URL` into the JS bundle at **build time** — `cloudbuild-web.yaml` passes it through as `--build-arg` and also deploys to Cloud Run as its last step:

```bash
gcloud builds submit --config=cloudbuild-web.yaml \
  --substitutions=_REGION=REGION,_SERVICE_NAME=homeserv-web,_VITE_API_URL=https://homeserv-api-xxxxx-REGION.a.run.app/api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)
```

## 5. Map `home-serv.in` with an external HTTPS Load Balancer

With two Cloud Run services, a Load Balancer is the right tool — it gives you one static IP, host-based routing (`home-serv.in` → frontend, `api.home-serv.in` → backend), and a single managed TLS cert for both, rather than juggling two separate Cloud Run domain mappings.

**Reserve a static IP:**
```bash
gcloud compute addresses create homeserv-lb-ip --global
gcloud compute addresses describe homeserv-lb-ip --global --format='get(address)'
```
Note the IP — you'll point DNS at it below.

**Serverless NEGs** (one per Cloud Run service, same region as the service):
```bash
gcloud compute network-endpoint-groups create homeserv-web-neg \
  --region=REGION --network-endpoint-type=serverless --cloud-run-service=homeserv-web

gcloud compute network-endpoint-groups create homeserv-api-neg \
  --region=REGION --network-endpoint-type=serverless --cloud-run-service=homeserv-api
```

**Backend services** wrapping each NEG:
```bash
gcloud compute backend-services create homeserv-web-backend --global --load-balancing-scheme=EXTERNAL_MANAGED
gcloud compute backend-services add-backend homeserv-web-backend \
  --global --network-endpoint-group=homeserv-web-neg --network-endpoint-group-region=REGION

gcloud compute backend-services create homeserv-api-backend --global --load-balancing-scheme=EXTERNAL_MANAGED
gcloud compute backend-services add-backend homeserv-api-backend \
  --global --network-endpoint-group=homeserv-api-neg --network-endpoint-group-region=REGION
```

**URL map** — `home-serv.in`/`www` go to the frontend by default; `api.home-serv.in` is routed to the backend:
```bash
gcloud compute url-maps create homeserv-lb --default-service=homeserv-web-backend

gcloud compute url-maps add-path-matcher homeserv-lb \
  --path-matcher-name=api-matcher \
  --default-service=homeserv-api-backend \
  --new-hosts=api.home-serv.in
```

**Managed SSL cert** covering all three hostnames:
```bash
gcloud compute ssl-certificates create homeserv-cert \
  --domains=home-serv.in,www.home-serv.in,api.home-serv.in --global
```

**HTTPS proxy + forwarding rule** (binds the cert + URL map to the static IP on port 443):
```bash
gcloud compute target-https-proxies create homeserv-https-proxy \
  --url-map=homeserv-lb --ssl-certificates=homeserv-cert

gcloud compute forwarding-rules create homeserv-https-rule \
  --global --target-https-proxy=homeserv-https-proxy --address=homeserv-lb-ip --ports=443
```

**Optional HTTP → HTTPS redirect** (plain port 80 traffic bounces to https):
```bash
cat <<EOF | gcloud compute url-maps import homeserv-http-redirect --global
defaultUrlRedirect:
  httpsRedirect: true
EOF
gcloud compute target-http-proxies create homeserv-http-proxy --url-map=homeserv-http-redirect
gcloud compute forwarding-rules create homeserv-http-rule \
  --global --target-http-proxy=homeserv-http-proxy --address=homeserv-lb-ip --ports=80
```

**DNS in Cloudflare** — add these A records, all pointing at the reserved IP, set to **DNS only (grey cloud, not proxied)**:
- `home-serv.in` → `<LB_IP>`
- `www.home-serv.in` → `<LB_IP>`
- `api.home-serv.in` → `<LB_IP>`

Keep Cloudflare's proxy **off** for now — Google's managed cert verifies ownership by checking that these hostnames resolve directly to the LB's IP, which an orange-clouded record would hide. You can turn Cloudflare's proxy back on afterward once the cert is `ACTIVE`, as long as its SSL mode is set to "Full (strict)".

Check provisioning status (can take anywhere from a few minutes to ~1 hour after DNS propagates):
```bash
gcloud compute ssl-certificates describe homeserv-cert --global --format='get(managed.status)'
```

**Harden it**: once the LB is working, stop Cloud Run from being reachable directly at its `*.run.app` URL so all traffic is forced through the LB/domain:
```bash
gcloud run services update homeserv-web --region=REGION --ingress=internal-and-cloud-load-balancing
gcloud run services update homeserv-api --region=REGION --ingress=internal-and-cloud-load-balancing
```

From here on, rebuild the frontend pointing `VITE_API_URL` at `https://api.home-serv.in/api` instead of the raw `*.run.app` URL — it's the stable, permanent address:
```bash
gcloud builds submit --config=cloudbuild-web.yaml \
  --substitutions=_REGION=REGION,_SERVICE_NAME=homeserv-web,_VITE_API_URL=https://api.home-serv.in/api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)
```

## 6. Lock down CORS

Now that the domain is live, redeploy the backend restricting CORS to it instead of allowing all origins:
```bash
gcloud run services update homeserv-api \
  --region=REGION \
  --set-env-vars="MONGODB_URI=...,CORS_ORIGIN=https://home-serv.in,https://www.home-serv.in"
```

## 7. Deploy the Admin console as its own IAP-protected service

The Admin UI is the same codebase, built with a different entry point (`VITE_APP_MODE=admin` — see `src/main.tsx`), pointed at the **same** `homeserv-api` backend and the **same** MongoDB. It deploys as its own Cloud Run service (`homeserv-admin`), reachable only by Google accounts you explicitly allow, via Identity-Aware Proxy (IAP) in front of it on the Load Balancer. No separate backend, no separate database, no custom login code to write.

**Build and deploy it** — deliberately with no `--allow-unauthenticated` (`cloudbuild-admin.yaml` already omits it):
```bash
gcloud builds submit --config=cloudbuild-admin.yaml \
  --substitutions=_SERVICE_NAME=homeserv-admin,_VITE_API_URL=https://api.home-serv.in/api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)
```

**Serverless NEG + backend service**, same pattern as `web`/`api`:
```bash
gcloud compute network-endpoint-groups create homeserv-admin-neg \
  --region=REGION --network-endpoint-type=serverless --cloud-run-service=homeserv-admin

gcloud compute backend-services create homeserv-admin-backend --global --load-balancing-scheme=EXTERNAL_MANAGED
gcloud compute backend-services add-backend homeserv-admin-backend \
  --global --network-endpoint-group=homeserv-admin-neg --network-endpoint-group-region=REGION
```

**Route `admin.home-serv.in` to it** in the existing URL map:
```bash
gcloud compute url-maps add-path-matcher homeserv-lb \
  --path-matcher-name=admin-matcher \
  --default-service=homeserv-admin-backend \
  --new-hosts=admin.home-serv.in
```

**Extend the SSL cert** to cover the new hostname — Google-managed certs are immutable, so this means creating a new cert with all four hostnames and swapping it onto the HTTPS proxy (the old one can be deleted once the new one is `ACTIVE`):
```bash
gcloud compute ssl-certificates create homeserv-cert-v2 \
  --domains=home-serv.in,www.home-serv.in,api.home-serv.in,admin.home-serv.in --global

# wait for it to become ACTIVE (same DNS-must-point-here requirement as before), then:
gcloud compute target-https-proxies update homeserv-https-proxy --ssl-certificates=homeserv-cert-v2
gcloud compute ssl-certificates delete homeserv-cert --global
```

**DNS in Cloudflare**: add one more record, same as the others — `admin.home-serv.in` → `<LB_IP>`, DNS only (grey cloud) until the cert is `ACTIVE`.

**Enable IAP on just this backend service** (one-time OAuth consent screen setup is needed first if you've never used IAP/OAuth in this project — do this via [console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent): choose "External", publish it, and since you'll be the only user, add yourself under "Test users" rather than going through Google's verification review):
```bash
gcloud compute backend-services update homeserv-admin-backend --global --iap=enabled
```

**Grant yourself access** — this is the actual access-control list; only accounts added here can ever get past IAP:
```bash
gcloud iap web add-iam-policy-binding \
  --resource-type=backend-services --service=homeserv-admin-backend \
  --member="user:narasimha.proddutoor@gmail.com" --role="roles/iap.httpsResourceAccessor"
```

**Let IAP actually call your Cloud Run service** — IAP forwards the request using its own service identity, which needs `run.invoker` on the service (replace `PROJECT_NUMBER`, found via `gcloud projects describe chat-bot-488712 --format='value(projectNumber)'`):
```bash
gcloud run services add-iam-policy-binding homeserv-admin \
  --region=REGION \
  --member="serviceAccount:service-PROJECT_NUMBER@gcp-sa-iap.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

**Harden ingress** the same way as the other two services:
```bash
gcloud run services update homeserv-admin --region=REGION --ingress=internal-and-cloud-load-balancing
```

Now `https://admin.home-serv.in` prompts a Google Sign-In, checks your email against the IAP access list, and only then shows the Admin console. Anyone else gets Google's own "you don't have access" page — never your app's content, since the request never reaches Cloud Run otherwise.

## Redeploying after code changes

Same commands as steps 3, 4 and 7 — all three configs already end with a Cloud Run deploy, so there's nothing extra to run:
```bash
# backend
gcloud builds submit --config=server/cloudbuild-api.yaml \
  --substitutions=_REGION=REGION,_SERVICE_NAME=homeserv-api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)

# frontend (rebuild needed any time VITE_API_URL or the UI changes)
gcloud builds submit --config=cloudbuild-web.yaml \
  --substitutions=_REGION=REGION,_SERVICE_NAME=homeserv-web,_VITE_API_URL=https://api.home-serv.in/api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)

# admin console (same source, different build mode)
gcloud builds submit --config=cloudbuild-admin.yaml \
  --substitutions=_SERVICE_NAME=homeserv-admin,_VITE_API_URL=https://api.home-serv.in/api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)
```

### Automating this with a Cloud Build trigger

Instead of running these by hand, connect the GitHub repo in Cloud Build and create three triggers (Console → Cloud Build → Triggers → Connect Repository):
- one pointed at `server/cloudbuild-api.yaml`, with `_SERVICE_NAME=homeserv-api` (this config has no `_VITE_API_URL` substitution — the API doesn't need one)
- one pointed at `cloudbuild-web.yaml`, with `_VITE_API_URL=https://api.home-serv.in/api` and `_SERVICE_NAME=homeserv-web`
- one pointed at `cloudbuild-admin.yaml`, with `_VITE_API_URL=https://api.home-serv.in/api` and `_SERVICE_NAME=homeserv-admin`

All three fire automatically from `$BRANCH_NAME`/`$COMMIT_SHA` on the push that triggered them — every `git push` to `main` redeploys all three services with zero manual commands. **This is still separate from the `git push` to GitHub itself**, which stays under your control as before.

## Cost note

Cloud Run scales to zero when idle — you only pay for the VM running MongoDB continuously (a small `e2-micro` is enough for this dataset) plus the VPC connector's minimal always-on cost.
