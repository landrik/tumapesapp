# TumaPesa — React Native + Expo

A TypeScript Expo app wired to the `services/api` Express + MongoDB API.

## Prerequisites

- Node.js 18+
- The backend running locally (see `../../services/api/README.md`)
- Expo Go on a device, or an iOS Simulator / Android Emulator

## Setup

```bash
npm install
npm start
```

## Connecting to the backend

`src/api/client.ts` picks a base URL automatically:

| Target | URL used |
|---|---|
| iOS Simulator / web | `http://localhost:3000/v1` |
| Android Emulator | `http://10.0.2.2:3000/v1` |
| **Physical device** | needs a manual change — see below |

On a physical device, `localhost` resolves to the phone itself, so edit `LOCAL_HOST` in `src/api/client.ts` to your computer's LAN IP:

```ts
const LOCAL_HOST = '192.168.1.x'; // your machine's IP
```

Both devices must be on the same network. Run `npm run start:tunnel` only if that isn't possible.

## Test credentials

Run `npm run seed` in the backend first, then log in with:

| Field | Value |
|---|---|
| Email | `test@example.com` |
| Password | `Password123` |

A second seeded account (`jane@example.com` / `SecurePass1`) has no KYC record, useful for testing unverified states.

## Endpoint coverage

Every backend route is wired up:

| Backend route | Used by |
|---|---|
| `POST /auth/login`, `/register`, `/logout`, `/refresh`, `/reset-password` | `authSlice`, Login/Register/Address/ForgotPassword screens |
| `GET/PATCH /users/me` | `ProfileHome`, `EditProfile` |
| `POST /users/push-token` | `useNotifications` |
| `GET/PATCH /users/notification-prefs` | `NotificationPreferences` |
| `POST /kyc/submit`, `GET /kyc/status` | `KycFlowScreen`, `KycStatus` |
| `GET /rates`, `/rates/corridors` | `ratesSlice`, `useExchangeRate` |
| `GET/POST/PATCH/DELETE /recipients` | `recipientSlice`, Recipients + Send screens |
| `POST /transfers`, `/:id/confirm`, `GET /transfers`, `DELETE /:id` | `transferSlice`, Send + Activity screens |

## Deviations from the original spec

These are deliberate, and each is commented in the source:

- **`expo-face-detector` removed.** Deprecated and removed from the Expo SDK; the KYC selfie step uses `expo-image-picker` instead.
- **`expo-camera` removed.** `expo-image-picker`'s `launchCameraAsync` covers document capture without a second camera dependency.
- **`@types/react-native` removed.** React Native has shipped its own types since 0.71; the separate package conflicts.
- **`airtime` delivery method dropped.** The backend's `Recipient` model only accepts `bank_transfer`, `mobile_money`, and `cash_pickup`.
- **KYC screen moved out of the auth stack.** `RootNavigator` switches to the main tabs the moment a token exists, so a KYC screen inside `AuthNavigator` was unreachable. It now renders from `RootNavigator` via a `kycPromptPending` flag, and is reachable again from Profile → Identity verification.
- **Transaction PIN is client-side only.** The backend has no PIN concept; it's stored in `expo-secure-store` and gates the confirm step in the UI only. Actual authorization is the JWT.
- **No gradient / charting libraries.** `QuickSendWidget` uses a solid brand card and `ExchangeRateModal` uses a static sparkline placeholder, rather than adding `expo-linear-gradient` and a chart library.
- **`start` no longer uses `--tunnel`.** Tunnels fail often and aren't needed on a shared network; use `npm run start:tunnel` if you need one.

## Structure

```
src/
├── api/          client.ts (+ auth, users, kyc, rates, recipients, transfer)
├── components/   common/, home/, modals/
├── constants/    colors.ts, deliveryMethods.ts
├── hooks/        useAuth, useExchangeRate, useNotifications
├── navigation/   Root, Auth, MainTab, SendMoney, Activity, Recipients, Profile
├── screens/      auth/, home/, send/, activity/, recipients/, profile/, shared/
├── store/        index.ts, hooks.ts, slices/
├── types/        models.ts (mirrors backend schemas), navigation.ts
└── utils/        biometrics.ts, notifications.ts, pin.ts
```

Run `npm run typecheck` to verify the project compiles.
