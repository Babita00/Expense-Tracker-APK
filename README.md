# Kharcha — Nepali Expense Tracker

A personal expense diary built around the **Bikram Sambat** calendar. Record what
you spend in a few seconds, then see where the money actually went, by Nepali day
and Nepali month.

Everything is stored **on your device only**. No accounts, no server, no sync.

---

## The four screens

| Screen | What it does |
|---|---|
| **Dashboard** | Month total as the headline figure, change vs last month, transactions / top category / daily average / biggest single expense, a ranked category bar chart, and a six-month comparison chart. |
| **Expenses** | Every entry, filtered by Nepali month *or* a single Nepali day, and by category. Tap any row to edit or delete it. |
| **Categories** | The 15 built-in categories plus any you add, each with its all-time usage and total. |
| **Settings** | Light / dark / system theme, backup download & restore, and a reset. |

Tap **+** anywhere to add an expense: amount → category → date (defaults to
today) → optional note → save.

---

## Nepali dates

The BS calendar is the app's primary date system — every filter, group and chart
is organised by Nepali months and years, and the date picker is a real BS
calendar with Devanagari month names alongside the romanised ones.

- Supported range: **BS 2000 – 2090**
- Conversion is handled by [`nepali-date-converter`](https://www.npmjs.com/package/nepali-date-converter)
- Month lengths come from that package's published tables, so 32-day months like
  Ashadh 2083 are handled correctly
- The Gregorian equivalent is shown as a secondary cue on the date picker

Amounts use the South Asian grouping convention: `Rs. 1,24,200`, not `Rs. 124,200`.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm test           # 44 tests: calendar maths, aggregation, and full UI flows
npm run build      # type-check + production bundle into dist/
npm run lint
```

---

## Building the APK

The Android project is already scaffolded and configured — app id
`com.babita.kharcha`, app name **Kharcha**, custom launcher icon. What is *not*
on this machine is a JDK and the Android SDK, which any APK build needs. Two ways
to get one:

### Option A — build it in the cloud (nothing to install)

`.github/workflows/android.yml` is ready to go. Push this folder to a **private**
GitHub repo and the workflow builds the APK on GitHub's runners, which already
have the JDK and Android SDK:

```bash
git init && git add -A && git commit -m "Kharcha: Nepali expense tracker"
gh repo create kharcha --private --source=. --push
```

Then open the repo → **Actions** → **Build Android APK** → the run → download the
`kharcha-apk` artifact. Unzip it on your phone and install `app-debug.apk`
(Android will ask you to allow installing from that source — this is expected for
any app not from the Play Store).

Every later push to `main` rebuilds it automatically.

### Option B — build locally

Install a JDK 21 and the Android SDK (Android Studio is the easy path), then:

```bash
npm run cap:sync
cd android
./gradlew assembleDebug          # Windows: .\gradlew.bat assembleDebug
```

The APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

`npm run android:open` opens the project in Android Studio instead, if you'd
rather build and deploy from there.

> **Debug vs release.** `assembleDebug` produces an APK signed with the shared
> debug key — fine for installing on your own phone, not for distribution. For a
> release build you'd generate a keystore and run `assembleRelease`.

---

## Your data

Expenses live in the browser/WebView's `localStorage` under
`nepali-expense-tracker/v1`. That means:

- It survives closing the app and restarting the phone.
- It does **not** survive uninstalling the app or clearing its storage.
- Reinstalling a newer APK over the top keeps it; uninstalling first does not.

So use **Settings → Download backup** now and then. Restore accepts either the
`.json` file or pasted text, and everything read back is validated — a truncated
or hand-edited backup can't put the app into a broken state.

Deleting a category never deletes money: its expenses move to **Other**.

---

## How it's built

Plain React + TypeScript on Vite, wrapped with Capacitor for Android. No UI
framework, no chart library — the charts are ~150 lines of CSS-driven markup, so
the whole bundle is 75 kB gzipped and works offline.

```
src/
  lib/nepaliDate.ts   BS calendar: conversion, month lengths, grids, formatting
  lib/analytics.ts    slicing and aggregation shared by the screens
  lib/money.ts        rupee formatting and amount parsing
  lib/storage.ts      persistence, validation, backup
  store.tsx           reducer + context
  components/         shared UI: sheet, icons, date picker, month nav, toggles
  features/           one folder per screen (dashboard, expenses, categories, settings)
  test/               calendar, analytics and end-to-end UI tests
```

Each feature folder holds the same four things, so a screen can be read top to
bottom without leaving it:

```
features/categories/
  CategoriesPage.tsx  layout only - what goes where
  components/         the pieces it lays out
  hooks/              store data, memoised into what the page renders
  utils/              the rules, as pure functions (sorting, usage, validation)
  types.ts            the shapes those rules pass around
```

### Charts

Both charts are single-series, so every bar is the same colour — categories are
told apart by their label and icon, never by hue (which also sidesteps the fact
that 15 categories is far past the number of colours anyone can distinguish).
The month chart uses emphasis rather than a colour ramp: the selected month is
the full-strength blue, the rest a lighter step of the same hue. Each chart has
a **Table** toggle showing the same numbers, and both themes are defined against
their own surface rather than being an automatic inversion.
