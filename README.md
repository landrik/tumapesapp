# TumaPesa

A full-stack prototype international money transfer app: React Native/Expo
mobile client + Express/MongoDB backend.

```
tumapesapp/
├── apps/
│   └── mobile/      # Expo (React Native) app — see apps/mobile/README.md
└── services/
    └── api/         # Express + MongoDB backend — see services/api/README.md
```

These are two independent projects (the mobile app talks to the backend over
HTTP, not via shared code), each with its own `package.json` and
dependencies — not an npm/yarn workspace. Install and run each separately:

```bash
# Terminal 1 — backend
cd services/api
npm install
cp .env.example .env
npm run seed   # optional demo data
npm run dev

# Terminal 2 — mobile app
cd apps/mobile
npm install
npm start
```

See each project's own README for full details, including deploying the
backend (Render + MongoDB Atlas) and building the mobile app for testers
(EAS Build).
