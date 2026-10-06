# TumaPesa Mock Backend

An Express + TypeScript + MongoDB REST API mirroring a real-world international money transfer service.

## Setup

```bash
npm install
cp .env.example .env   # edit MONGO_URI / JWT_SECRET as needed
npm run seed            # optional: seeds a demo user, recipients, transfers
npm run dev
```

Runs on `http://localhost:3000`, API mounted at `http://localhost:3000/v1`.

## Live exchange rates

Exchange rates are **real**, not hardcoded. `GET /v1/rates` fetches the current
mid-market rate from [ExchangeRate-API's free, keyless "Open Access" endpoint](https://www.exchangerate-api.com/docs/free),
then applies this app's own markup and fee on top — the same two-part pricing
every real remittance service uses (WorldRemit, Wise, Remitly, etc.): a spread
below the true mid-market rate, plus a separate flat fee.

- **No API key required.**
- Rates are cached in-memory for 1 hour per currency pair (the provider only
  updates once every 24h, so this is generous, not aggressive).
- If the live provider is unreachable, requests **fall back to a static rate**
  defined per-corridor in `src/data/rates.ts` rather than failing outright.
  The response includes `rateSource: "live" | "fallback"` so callers can tell
  which was used.
- **Attribution requirement:** ExchangeRate-API's free tier requires visible
  attribution wherever the rates are shown to end users. The mobile app's
  About screen credits ExchangeRate-API for this reason — keep that credit
  if you extend rate display elsewhere in the app.

Corridors (`src/data/rates.ts`) define which currency pairs are supported
and their fee/estimated delivery time — not the rate itself, which is always
fetched live at request time.

## Countries served

`GET /v1/countries` lists the countries recipients can be paid in, derived
from the same corridor data (so it can't drift out of sync with what
actually has a rate). `POST /v1/recipients` uses this to derive `currency`
from `country` server-side — client-supplied currency is ignored.

## Endpoints

See inline route comments in `src/routes/` for the full list: `/auth`,
`/users`, `/kyc`, `/rates`, `/countries`, `/recipients`, `/transfers`.
`GET /v1` itself returns a quick summary of what's mounted.

## Notes

- All domain data lives in MongoDB (Mongoose models under `src/data/`).
  KYC document uploads are stored in GridFS.
- JWT auth via `Authorization: Bearer <token>`.
- Environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
