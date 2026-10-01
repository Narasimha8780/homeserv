# Deploying to Google Cloud (Cloud Run + VM)

Three pieces:
- **MongoDB** — on a Compute Engine VM you create yourself
- **Backend API** — Cloud Run service, built from `server/Dockerfile`
- **Frontend** — Cloud Run service, built from `Dockerfile` (root)

Android is out of scope for this guide — browser only, per your current setup.

Run everything below from the project root unless noted. Replace `YOUR_PROJECT_ID` and `REGION` (e.g. `asia-south1` for Mumbai) throughout.

```
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com compute.googleapis.com vpcaccess.googleapis.com
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
gcloud artifacts repositories create homeserv --repository-format=docker --location=REGION
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

## 5. Lock down CORS

Once you have the frontend's real URL, redeploy the backend restricting CORS to it instead of allowing all origins:
```bash
gcloud run services update homeserv-api \
  --region=REGION \
  --set-env-vars="MONGODB_URI=...,CORS_ORIGIN=https://homeserv-web-xxxxx-REGION.a.run.app"
```

## Redeploying after code changes

Same two commands as steps 3 and 4 — both configs already end with a Cloud Run deploy, so there's nothing extra to run:
```bash
# backend
gcloud builds submit --config=server/cloudbuild-api.yaml \
  --substitutions=_REGION=REGION,_SERVICE_NAME=homeserv-api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)

# frontend (rebuild needed any time VITE_API_URL or the UI changes)
gcloud builds submit --config=cloudbuild-web.yaml \
  --substitutions=_REGION=REGION,_SERVICE_NAME=homeserv-web,_VITE_API_URL=https://homeserv-api-xxxxx-REGION.a.run.app/api,BRANCH_NAME=main,COMMIT_SHA=manual-$(date +%s)
```

### Automating this with a Cloud Build trigger

Instead of running these by hand, connect the GitHub repo in Cloud Build and create two triggers (Console → Cloud Build → Triggers → Connect Repository):
- one pointed at `server/cloudbuild-api.yaml`, with `_SERVICE_NAME=homeserv-api` (this config has no `_VITE_API_URL` substitution — the API doesn't need one)
- one pointed at `cloudbuild-web.yaml`, with `_VITE_API_URL` set to the backend's Cloud Run URL and `_SERVICE_NAME=homeserv-web`

Both fire automatically `$BRANCH_NAME`/`$COMMIT_SHA` from the push that triggered them — every `git push` to `main` redeploys both services with zero manual commands. **This is still separate from the `git push` to GitHub itself**, which stays under your control as before.

## Cost note

Cloud Run scales to zero when idle — you only pay for the VM running MongoDB continuously (a small `e2-micro` is enough for this dataset) plus the VPC connector's minimal always-on cost.
