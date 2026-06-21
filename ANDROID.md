# ANDROID.md — Building & releasing "The World We Live In" for Google Play

The game is a Vite/React/Three.js web app wrapped with **Capacitor** into a native Android shell.
This is the complete, ordered path from source to a Play-ready release. The web build, Capacitor
config, scripts, and the `AdMobService` integration seam are already in the repo; the steps below
need a machine with the Android toolchain.

> ⚠️ This machine does **not** have JDK 17 or Android Studio installed, so the native build steps
> (`cap add android`, Gradle, signing) have **not** been run here — they're documented to run on a
> configured machine. Everything up to `dist/` (`npm run build`) is verified working.

---

## 1. Prerequisites (one-time, on the build machine)
- **Node.js 20+** and npm (already used for the web app).
- **JDK 17** (Temurin/Adoptium recommended). Verify: `java -version`.
- **Android Studio** (latest), with: Android SDK Platform (API 34/35), Android SDK
  Build-Tools, Platform-Tools, and an emulator or a physical device with USB debugging.
- Accept SDK licenses: `sdkmanager --licenses` (or via Android Studio > SDK Manager).
- Env: `JAVA_HOME` → JDK 17, `ANDROID_HOME` → SDK, and `platform-tools` on `PATH`.

## 2. Add the Android platform (one-time)
Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`) is already a dependency and
`capacitor.config.ts` is set (`appId: com.twwli.game`, `appName: "The World We Live In"`,
`webDir: dist`). From the project root:
```bash
npm install
npm run build          # produces dist/
npx cap add android    # creates the android/ native project (commit it)
npx cap sync           # copies the web build + plugins into android/
```

## 3. Run / iterate
```bash
npm run build && npx cap sync android   # after any web change
npx cap open android                    # open in Android Studio → Run ▶
# or, with a device connected:
npm run android:run
```
The `android/` folder is a normal Gradle project; build artifacts under `android/app/build/` and
`*.keystore` are gitignored.

## 4. AdMob production wiring (monetization)
Gameplay already calls a provider-agnostic `AdService` (rewarded / interstitial / banner). On
web/dev it uses `MockAdService`; on device, wire real AdMob:

1. **Install the plugin:** `npm install @capacitor-community/admob && npx cap sync`.
2. **Fill in `src/services/ads/AdMobService.ts`** — the methods already contain the exact SDK
   calls as comments. Use a dynamic import so the web build stays clean:
   ```ts
   const { AdMob } = await import('@capacitor-community/admob');
   await AdMob.initialize({ initializeForTesting: import.meta.env.VITE_ADMOB_TESTING === 'true' });
   ```
   Set `ready = true` after init so `getAdService()` picks AdMob over the mock on native.
3. **IDs via env:** copy `.env.example` → `.env` and fill `VITE_ADMOB_*`. Use Google's **test
   ad unit IDs** during development; swap to real IDs (and `VITE_ADMOB_TESTING=false`) for release.
4. **AndroidManifest** (`android/app/src/main/AndroidManifest.xml`): add the app ID and the
   ad-id permission (Android 13+):
   ```xml
   <manifest ...>
     <uses-permission android:name="com.google.android.gms.permission.AD_ID"/>
     <application ...>
       <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
                  android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
     </application>
   </manifest>
   ```
   `INTERNET` is included by Capacitor by default.
5. **Consent (required in EEA/UK/etc.):** integrate Google's **UMP** consent flow before serving
   personalized ads; gate `AdMob.requestConsentInfo()` / show the consent form in `init()`.
6. **Policy guardrails (already designed in):** rewarded ads are opt-in for a concrete boost;
   interstitials only at era transitions (frequency-capped); banners only in menus; no ads mid-action.

## 5. App identity & versioning
- App name / id: `capacitor.config.ts` (`appName`, `appId = com.twwli.game`).
- Bump `versionCode` (integer, must increase every upload) and `versionName` (e.g. `0.1.0`) in
  `android/app/build.gradle`.
- Icons / splash: place sources and run `@capacitor/assets` (or set via Android Studio).

## 6. Signing & release build
1. **Generate an upload keystore** (keep it safe + backed up; losing it blocks future updates):
   ```bash
   keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```
2. **Configure signing** in `android/app/build.gradle` (`signingConfigs` + `buildTypes.release`),
   referencing the keystore via a gitignored `android/keystore.properties` (never commit secrets).
3. **Build the release bundle** (Play requires an AAB):
   ```bash
   cd android && ./gradlew bundleRelease     # -> android/app/build/outputs/bundle/release/app-release.aab
   ```
   (`assembleRelease` produces an APK for sideload testing.)
4. Consider enabling **Play App Signing** when creating the app in Play Console.

## 7. Google Play Store listing checklist
- [ ] Play Console developer account; create the app.
- [ ] **Privacy policy URL** (required — the game shows ads / uses the advertising ID).
- [ ] **Data safety** form: declare AdMob data collection (device/advertising ID, approximate usage).
- [ ] **Content rating** questionnaire (combat is abstract/low-poly; no real-world ideologies).
- [ ] **Ads** declaration = Yes; configure families policy if targeting children (this title is general audience).
- [ ] Target **API level** meets the current Play requirement.
- [ ] Store listing: title, short + full description, app icon (512²), feature graphic (1024×500),
      phone screenshots (portrait + landscape), category = Simulation/Strategy.
- [ ] Upload the signed **AAB** to a testing track (internal → closed → production).

## 8. iOS (future)
The same Capacitor web build targets iOS: `npx cap add ios`, AdMob via the same plugin, Xcode +
Apple Developer account for signing. Not in scope yet.

---
## Status in this repo
- ✅ Web build (`npm run build`) → `dist/` (code-split; ~45 KB entry + lazy three.js chunk).
- ✅ Capacitor deps + `capacitor.config.ts` + scripts (`cap:sync`, `cap:android`, `android:run`).
- ✅ `AdService` abstraction with `AdMobService` integration seam (TODOs marked) + `.env.example`.
- ⬜ `android/` native project — generated by `npx cap add android` on a machine with JDK 17 +
  Android Studio (not installed here).
- ⬜ Real AdMob IDs, consent flow, keystore/signing, Play listing assets — owner-provided at release.
