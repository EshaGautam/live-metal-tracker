# Metal Price Tracker

A React Native mobile app that displays live spot prices for four precious metals (Gold, Silver, Platinum, and Palladium) using the [GoldAPI.io](https://www.goldapi.io/) REST API. The UI is styled for a fintech use case with expandable cards, market summary stats, pull-to-refresh, and loading skeletons.

---

## Solution overview

| Area | Details |
|------|---------|
| **Platform** | React Native `0.85.3` (Android & iOS) |
| **Language** | TypeScript |
| **Data source** | GoldAPI.io — `GET /api/{METAL}/{CURRENCY}` (e.g. `XAU/USD`) |
| **Auth** | API key via `x-access-token` header (`react-native-config` + `.env`) |
| **Metals** | XAU (Gold), XAG (Silver), XPT (Platinum), XPD (Palladium) |
| **Currency** | USD (prices, change, and gram rates formatted for US locale) |

### Main features

- Live spot price, daily change (`ch`), change percent (`chp`), and 24k price per gram
- **Market summary** — count of live quotes, metals up/down, top mover
- **Expandable metal cards** — tap to show high, low, bid, ask, open, and previous close
- **Pull-to-refresh** and header **Refresh** button
- **Loading skeletons** while each metal request completes
- Per-metal error handling (one failure does not block others)
- Safe area support for notched devices

### Project structure

```
src/
├── component/
│   ├── MetalCard.tsx          # Price card with expand/collapse details
│   ├── MetalCardSkeleton.tsx  # Loading placeholder matching card layout
│   ├── MarketSummary.tsx      # Up/down / top mover summary row
│   └── SkeletonBox.tsx        # Animated skeleton block
├── hook/
│   └── useFetchMetalPrice.ts  # API client, METALS_CONFIG, useFetchMetalPrices
├── screen/
│   └── HomeScreen.tsx         # Main screen (list, header, refresh)
├── util/
│   └── format.ts              # USD formatting & timestamp helpers
└── theme.ts                   # Colors, spacing, radius tokens
```

---

## How to execute (local development)

### Prerequisites

- **Node.js** `>= 22.11.0` (see `package.json` `engines`)
- **npm** (or Yarn)
- [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for your OS
- **Android**: Android Studio, SDK, emulator or USB device
- **iOS** (macOS only): Xcode, CocoaPods, simulator or device

### 1. Clone and install dependencies

```sh
git clone <repository-url>
cd MetalPriceTracker
npm install
```

### 2. Configure API key

Create a `.env` file in the project root (this file is gitignored):

```env
GOLD_API_KEY=your_goldapi_io_key_here
```

Sign up at [goldapi.io](https://www.goldapi.io/) and copy your access token into `GOLD_API_KEY`.

> **Note:** After changing `.env`, rebuild the native app (not just Metro reload). `react-native-config` reads env at build time on Android/iOS.

### 3. Start Metro

```sh
npm start
```

### 4. Run the app

**Android** (separate terminal):

```sh
npm run android
```

**iOS** (macOS, first time or after native dep changes):

```sh
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios
```

### 5. Other scripts

```sh
npm run lint    # ESLint
npm test        # Jest unit tests (App smoke test)
```

### Reloading during development

- **Android emulator:** `R` twice or Dev Menu (`Ctrl+M` / `Cmd+M`) → Reload
- **iOS simulator:** `R` in simulator

---

## Deployment notes

### Environment & secrets

- Never commit `.env` or API keys to source control (already listed in `.gitignore`).
- For CI/CD or store builds, inject `GOLD_API_KEY` via your pipeline’s secret store and generate `.env` before the native build step.
- **Android:** `android/app/build.gradle` applies `react-native-config` `dotenv.gradle` — env vars are bundled into the release build at compile time.
- **iOS:** Run `pod install` after env changes; ensure Xcode build phases pick up config from `react-native-config` (default RN linking).

### Android release build (outline)

1. Generate a release keystore and configure signing in `android/app/build.gradle`.
2. Set `GOLD_API_KEY` in `.env` (or CI secret) for the release build.
3. Build:

   ```sh
   cd android
   ./gradlew assembleRelease
   ```

4. Output APK/AAB: `android/app/build/outputs/`.

### iOS release build (outline)

1. Open `ios/MetalPriceTracker.xcworkspace` in Xcode.
2. Set team, bundle ID, and signing.
3. Ensure `.env` exists with `GOLD_API_KEY` before archiving.
4. **Product → Archive** and distribute via App Store or TestFlight.

### API usage in production

- Each app open triggers **4 parallel requests** (one per metal) on mount.
- Pull-to-refresh or **Refresh** triggers another **4 requests**.
- GoldAPI plans have **rate limits**; monitor usage on your dashboard and avoid auto-polling without backoff.
- The app fetches **once on mount** (`useEffect` with empty deps) to avoid dependency-loop re-fetches.

### Network

- The app requires **internet** access to reach `https://www.goldapi.io`.
- Android cleartext is not required (HTTPS only).

---

## Approach

- **Custom hook (`useFetchMetalPrices`)** centralizes fetching, loading/error state, and `refetch`. Metals are defined in `METALS_CONFIG` so adding/removing symbols is a single config change.
- **Parallel requests with `Promise.allSettled` pattern** (per-metal `forEach` + settle counter) so each card updates independently and failures are isolated.
- **Presentation mapping** (`mapMetalToCardProps`) keeps API types separate from UI props and formats numbers in one place.
- **Minimal dependencies** — `axios`, `react-native-config`, `react-native-safe-area-context`; no navigation or global state library for this scope.
- **Fintech-oriented UI** — neutral palette, summary chips, press feedback on cards, skeleton loaders instead of spinners on cards.
- **Single-screen architecture** — `App.tsx` → `HomeScreen`; suitable for a focused price tracker MVP.

---

## Challenges faced

- **API rate limits** — Fetching four metals on every mount/refresh consumes four API credits; guarded against `useEffect` dependency loops that could cause repeated calls.
- **`react-native-config` on native** — Env vars require a **native rebuild** after `.env` changes; Metro-only reload is insufficient.
- **Partial failures** — One metal (e.g. unsupported symbol or quota error) can fail while others succeed; UI shows per-card errors and a global message only if all fail.
- **TypeScript + API shape** — GoldAPI returns many fields (including gram karat prices); types mirror the full response for future UI use.
- **React Native new architecture** — Project uses RN `0.85.x`; ensure JDK/Android SDK versions match [official RN docs](https://reactnative.dev/docs/set-up-your-environment) for your machine.

---

## API reference (used fields)

Example: `GET https://www.goldapi.io/api/XAU/USD`

| Field | Usage in app |
|-------|----------------|
| `price` | Main spot price on card |
| `ch`, `chp` | Change amount and percent pill |
| `price_gram_24k` | Subtitle (per gram, 24k) |
| `high_price`, `low_price`, `bid`, `ask`, `open_price`, `prev_close_price` | Expanded card details |
| `exchange` | Shown under metal name |
| `timestamp` | “Updated” time in header |

---

## License

Private project (`package.json` `"private": true`). Add a license file if you plan to open-source or distribute.
