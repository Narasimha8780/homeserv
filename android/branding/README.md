# Android launcher branding

The launcher uses the house symbol from the supplied HomeServ logo. The wordmark
and tagline are omitted for legibility at launcher size. Android displays
**HomeServ** below the icon, configured in `res/values/strings.xml` and
`capacitor.config.ts`.

`homeserv-symbol.png` is the transparent source artwork. To regenerate all five
launcher densities, run `./android/branding/generate-launcher-icons.sh` from the
repository root (requires ImageMagick 7). It generates legacy square and round
icons plus padded adaptive foregrounds. The adaptive background is white.

Build a fresh APK with `npm run android:build` on a machine with Java 21 and
Android SDK 36, then install `android/app/build/outputs/apk/debug/app-debug.apk`.
The installed package must be rebuilt to include the icon; updating web assets
alone does not change an installed launcher icon. Updating an existing installed
app also requires the same signing key. Some phone launchers cache icons; restart
the launcher if a successful update still shows the previous artwork.

This change affects Android launcher resources only, not browser branding.
