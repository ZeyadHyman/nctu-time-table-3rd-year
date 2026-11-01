# Build & Deployment Guide

Single codebase: **React + Vite PWA**. Mobile (Android/iOS) wraps the same build with Capacitor.

## 1. Web

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run preview    # serve dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages, nginx).

## 2. PWA (install on Android / iPhone / desktop)

- Built-in: `public/manifest.webmanifest`, `public/sw.js` (offline cache), icons.
- Register runs automatically in production (`npm run build` + `npm run preview`).
- **Android / Desktop Chrome:** open the site → menu → *Install app*.
- **iPhone:** Safari → Share → *Add to Home Screen*. (Apple does not support Web Push for home-screen apps unless you ship a native wrapper.)

Offline: first visit caches the app shell; timetable/attendance live in `localStorage` and work fully offline.

## 3. Android APK / AAB (Capacitor)

One-time setup (needs **Node 18+** and **Android Studio** with Android SDK):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Timetable" com.example.timetable --web-dir=dist
npm run build
npx cap add android
npx cap sync android
```

Open the native project:

```bash
npx cap open android     # opens Android Studio
```

### Signed APK

1. Android Studio → *Build → Generate Signed Bundle / APK → APK*.
2. Create a keystore (keep it safe — you cannot update the app without it).
3. Choose `release` → output `app-release.apk` → install on any phone.

### AAB for Google Play

Same wizard, but choose **Android App Bundle** → `app-release.aab`.
Upload in [Google Play Console](https://play.google.com/console). Play requires AAB (not APK) for new apps.

CLI alternative after opening Android Studio once:

```bash
cd android
./gradlew assembleRelease          # APK
./gradlew bundleRelease            # AAB
```

App name/icon: change in `android/app/src/main/res/values/strings.xml` and `res/mipmap-*` (or use `@capacitor/assets` generator).

## 4. iOS

Requires **macOS + Xcode + Apple Developer Program** ($99/yr). There is no way around Apple signing.

```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
```

- **Run on device:** Xcode → select your team under *Signing & Capabilities* → Run.
- **Ad-hoc / TestFlight:** Archive (Product → Archive) → distribute.
- **App Store:** same archive flow, submit in App Store Connect.

Without a Mac/developer account, iPhone users install via **PWA Add to Home Screen** (section 2).

## 5. Offline-first data

| Data        | Storage                         |
| ----------- | ------------------------------- |
| Timetable   | `localStorage` key `software-timetable-v2` |
| Attendance  | same store, separate `attendance` map (never wiped by profile edits) |
| Preferences | same store (`settings`, `prefs`) |

Export/import JSON from **Settings → Data** for backup/migration.

## 6. Tools checklist

- Node.js 18+ / npm
- Chrome/Edge/Firefox (PWA)
- Android Studio + JDK 17 (APK/AAB)
- Xcode 15+ + Apple Developer account (iOS)
- Keystore for Android signing (back it up)
