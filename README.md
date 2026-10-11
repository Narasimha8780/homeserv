# HomeServ

A free local services directory (like JustDial/Sulekha) for plumbers, electricians, drivers, carpenters and more — built with React + Vite + Tailwind, wrapped for Android with Capacitor.

HomeServ does not handle bookings or payments. Customers browse verified local professionals ("Captains") and contact them directly by call or WhatsApp. Three experiences share one codebase:

- **Customer** — browse by category/city, view profiles & reviews, call or WhatsApp directly, save favorites
- **Captain** — register for free, manage your profile and availability, see profile views & contact clicks, view reviews
- **Admin** *(internal, secondary)* — approve new Captain ID verifications, manage categories

## Architecture

- `src/` — React + Vite + Tailwind frontend (web and Android)
- `server/` — Express + Mongoose API backend
- MongoDB — all cities, categories, captains and reviews are stored here (not in the frontend anymore). Favorites and language preference stay in the browser's `localStorage` since they're per-device, not shared data.

## UI & design system

- **Themes** — dark ("midnight glass", the default) and light, plus "Auto" (follows the device). Users switch in the account menu; the choice is saved per device.
- **Tokens, not raw colours** — every colour comes from semantic tokens in `src/index.css` (`bg-surface`, `bg-surface-2`, `text-ink`, `text-ink-2`, `border-line`, `bg-accent-soft`, `text-accent-ink`, `text-success-ink`, …). Use these instead of `bg-white` / `text-slate-*` so both themes keep working.
- **Building blocks** — `.card`, `.btn` + `.btn-primary` / `.btn-whatsapp` / `.btn-secondary`, `.input`, `.chip`, `.pill`, `.icon-btn` (in `src/index.css`), and React primitives in `src/components/ui/` (`Sheet` = bottom sheet on phones / dialog on desktop, `BottomNav`, `Avatar`, `Switch`, `Rating`, `EmptyState`, `Logo`).
- **Android** — the app draws edge-to-edge and pads itself with safe-area insets; status/nav bar icon colours follow the in-app theme (`src/utils/theme.ts`). Launcher icons and splash screens in `android/app/src/main/res` use the HomeServ mark.

## Location data (states, districts, villages) and "Detect my city"

The official **LGD list** (Local Government Directory, Ministry of Panchayati Raj — 35 states/UTs, ~780 districts, ~7,000 sub-districts/tehsils, ~6.8 lakh villages) powers two things:

- **Detect my city (GPS)** — the phone/browser gives a position; `GET /api/locations/nearest?lat=&lng=` returns the nearest HomeServ city (MongoDB `$geoNear`) plus the user's district/tehsil. Within 40 km the app switches city automatically; otherwise it offers the nearest city or to add the user's own place. The position is only used for this lookup — it isn't stored.
- **Choose step by step** — State → District → Mandal/Tehsil → Village (`/api/locations/states`, `/districts?stateCode=`, `/subdistricts?district=`, `/villages?subdistrict=`). The app then shows pros from the best city within **40 km** of that mandal (or any city in the same district), preferring one that has pros; `GET /api/locations/nearest?subdistrict=<code>` does the lookup. The chosen place is remembered on the device.
- **Find any village** — typing in the city picker searches the official list (`GET /api/locations/search?state=&q=`), so people can add their exact village/tehsil instead of typing a free-text name.

The LGD file has no coordinates, so approximate centre points for every district, sub-district and seeded city are precomputed in `server/src/data/lgdGeo.json` (see `server/scripts/build_lgd_geo.py` for how; typically 2–25 km from the real town centre — fine for picking the nearest city, not for street-level distance).

**Import it into MongoDB (one time, and again whenever you download a newer LGD file).** The CSV is ~40 MB, so it is not committed — keep it on your machine:

```
npm run server:install
cd server
MONGODB_URI="mongodb://127.0.0.1:27017/homeserv" npm run import:lgd -- /path/to/list-of-states-districts-sub-districts-and-villages-....csv
```

It takes ~15 seconds, is safe to re-run (it swaps the new data in at the end, so the live app keeps working), adds ~15 MB of data + ~40 MB of indexes, and also gives every existing city a location so GPS can find it.

For the **production database on the GCP VM** (no public IP), open an SSH tunnel from your machine and run the same command through it:

```
gcloud compute ssh YOUR_VM --zone=YOUR_ZONE -- -N -L 27018:localhost:27017      # leave running
MONGODB_URI="mongodb://homeserv:PASSWORD@localhost:27018/homeserv?authSource=homeserv" npm run import:lgd -- /path/to/lgd.csv
```

Deploy the updated API (it serves `/api/locations/*`) before or after the import — order doesn't matter. Without the import, GPS still finds the nearest of the seeded cities (they carry coordinates from `npm run server:seed`); the village search just returns nothing.

Data credits: LGD (Govt. of India, via Dataful); district boundaries © DataMeet (CC BY 2.5 IN); PIN code places © DataMeet / GeoNames (CC BY). These attributions are shown in the app's Help screen — keep them if you reuse the data.

## Running the app (local MongoDB)

Requires MongoDB running locally (`brew services start mongodb-community`, or just run `mongod` — this project was set up assuming it's already running on the default `mongodb://127.0.0.1:27017`).

**1. Install dependencies and seed the database** (first time only, or whenever you want to reset to sample data):
```
npm install
npm run server:install
npm run server:seed
```

**2. Start the backend API** (in one terminal):
```
npm run server:dev
```
Runs on `http://localhost:4000`. Configuration is in `server/.env` (`MONGODB_URI`, `PORT`).

**3. Start the frontend** (in another terminal):
```
npm run dev
```
Runs on `http://localhost:5173` and talks to the API at the URL in `.env` (`VITE_API_URL`, defaults to `http://localhost:4000/api`).

Note for Android: the Android app runs inside a device/emulator, where `localhost` refers to the device itself, not your computer. To test API calls from the Android app, point `VITE_API_URL` at your machine's LAN IP (or `10.0.2.2` for the Android emulator specifically) before running `npm run android:build`.

## Building the Android app

The Android app is a Capacitor wrapper around this same web app (`android/` directory) — one codebase, one UI, packaged as a native APK.

```
npm run android:build      # builds the web app, syncs it into the Android project, and assembles a debug APK
```

The APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`. Install it on a connected device or emulator with:

```
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Other useful scripts:

- `npm run android:sync` — rebuild the web app and copy it into the Android project (run this after any UI change, before rebuilding the APK)
- `npm run android:open` — open the native project in Android Studio

## Deploying to the cloud (Google Cloud Run)

See [DEPLOY.md](DEPLOY.md) for the full guide: MongoDB on a Compute Engine VM, the backend and frontend each as a Cloud Run service, and a separate IAP-protected Admin console (same codebase, same backend/DB, different build mode) — with `Dockerfile` + `cloudbuild-*.yaml` already set up for all three in this repo.

## Publishing to the Play Store

App ID: `in.homeserv.app` (based on home-serv.in). **This cannot change after your first upload.**

A release signing key already exists at `android/app/homeserv-release.jks`, referenced by `android/app/keystore.properties` (both gitignored — never commit them). **Back up both files somewhere safe outside this machine right now** (password manager, encrypted cloud storage). If you lose the keystore, you can never publish an update to this app again — Google cannot recover or reset it for you.

To build the signed release bundle for upload:

```
npm run android:release
```

This produces `android/app/build/outputs/bundle/release/app-release.aab` — this is the file you upload to Play Console, not the debug APK.

Steps in [Play Console](https://play.google.com/console):
1. Create a developer account ($25 one-time fee)
2. Create a new app, choose "App" + "Free"
3. Fill in the store listing: app icon (512×512), feature graphic (1024×500), at least 2 phone screenshots, short & full description
4. Add a **privacy policy URL** (required — this app collects Captain phone numbers/names)
5. Complete the Data Safety form (declare that you collect contact info) and the content rating questionnaire
6. Under Release → Production (or start with Internal testing first), upload `app-release.aab`
7. Submit for review (first-time review typically takes a few days)

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
