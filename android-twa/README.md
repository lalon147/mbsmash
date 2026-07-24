# MB Smash Repair — Android app

This wraps the existing web app into an installable Android APK. It does **not**
re-implement the UI: the app is a [Trusted Web Activity](https://developer.chrome.com/docs/android/trusted-web-activity/)
(TWA) that opens the live site — `https://mbsmash.vercel.app` — full-screen, with
its own icon, no browser chrome. Whatever ships to the website is instantly what
the app shows; there is nothing extra to release for most changes.

The wrapping is done with Google's [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).
All the configuration lives in [`twa-manifest.json`](./twa-manifest.json).

## Getting the APK (no local setup)

The easiest path — no Android tooling on your machine:

1. On GitHub, open **Actions → Build Android APK → Run workflow**.
2. When it finishes, open the run and download the **`mbsmash-android`** artifact.
   It contains the signed `.apk`.
3. Copy the `.apk` to the phone and open it to install (allow "install from
   unknown sources" when prompted). This is sideloading — no Play Store needed.

The workflow also builds an `.aab` (Android App Bundle), which is what you'd
upload if you ever put it on the Play Store.

## Removing the browser address bar (optional but recommended)

Out of the box the app works but shows a thin URL bar, because Android hasn't yet
been told the site trusts this app. To remove it:

1. In the workflow run's logs, find the **"Show signing fingerprint"** step and
   copy the `SHA256:` value (a colon-separated hex string).
2. In Vercel → the `mbsmash` project → **Settings → Environment Variables**, add
   `ASSETLINKS_SHA256` = that fingerprint (Production).
3. Redeploy. The app serves it at `/.well-known/assetlinks.json`; the wrapper
   verifies it on next launch and the URL bar disappears.

## A stable signing key (recommended before wider use)

With no keystore configured, each CI build generates a throwaway key. That still
installs, but two APKs signed with **different** keys can't update each other —
the phone makes you uninstall first. For a key that stays put:

```bash
keytool -genkeypair -v -keystore android.keystore -alias mbsmash \
  -keyalg RSA -keysize 2048 -validity 10000 -storepass 'CHOOSE-A-PASSWORD'
base64 -w0 android.keystore   # copy the output
```

Then add three **repository secrets** (GitHub → Settings → Secrets and variables
→ Actions):

- `ANDROID_KEYSTORE_BASE64` — the base64 blob above
- `ANDROID_KEYSTORE_PASSWORD` — the password you chose
- `ANDROID_KEY_PASSWORD` — same password, unless you set a separate key password

Keep `android.keystore` somewhere safe and out of git (it already is — see
`.gitignore`). Losing it means future updates need a fresh install.

## Building locally instead of in CI

Needs a JDK and the Android SDK. Bubblewrap can fetch both on first run:

```bash
npm install -g @bubblewrap/cli
cd android-twa
# put your android.keystore here (alias "mbsmash"), then:
bubblewrap build --skipPwaValidation
```

The signed APK lands in this directory. `bubblewrap` regenerates the Android
project from `twa-manifest.json` each build, so the generated `app/` folder is
gitignored on purpose.

## Changing app details

Edit [`twa-manifest.json`](./twa-manifest.json):

- `packageId` — the app's permanent identity (`app.mbsmash.twa`). Change it only
  **before** the app is in use anywhere; changing it later makes a separate app.
  If you change it, also update `ANDROID_PACKAGE_NAME` in Vercel so the
  assetlinks file matches.
- `appVersionCode` / `appVersionName` — bump these for each release you
  distribute (the code must increase for phones to accept an update).
- `name` / `launcherName`, colours, icons — cosmetic; icons come from the live
  web manifest.
