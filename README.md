# HomeServ

A free local services directory (like JustDial/Sulekha) for plumbers, electricians, drivers, carpenters and more — built with React + Vite + Tailwind, wrapped for Android with Capacitor.

HomeServ does not handle bookings or payments. Customers browse verified local professionals ("Captains") and contact them directly by call or WhatsApp. Three experiences share one codebase:

- **Customer** — browse by category/city, view profiles & reviews, call or WhatsApp directly, save favorites
- **Captain** — register for free, manage your profile and availability, see profile views & contact clicks, view reviews
- **Admin** *(internal, secondary)* — approve new Captain ID verifications, manage categories

## Running the web app

```
npm install
npm run dev
```

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
