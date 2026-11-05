# Payment Reminder Letters

Free offline browser tool for trades owners: answer a few questions and get a polite payment reminder as a text, email, printed letter, or lines to say.

Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.

## Native run

Use the Node major already installed on your machine (`node --version`). Do not pin or switch Node versions for this project.

```bash
npm ci
npm run dev
```

Open the printed local URL plus `paymentreminders/` (default base path).

Useful scripts:

```bash
npm run lint
npm run lint:copy
npm run typecheck
npm test
npm run build
npm run preview
```

Environment (optional): copy `.env.example` to `.env`.

- `VITE_BASE_PATH` default `/paymentreminders/`
- `SITE_URL` for canonical / social tags
- `VITE_PULSE_API` / `VITE_PULSE_SITE` are Phase 2 only (leave commented)

## Docker run (optional)

`NODE_VERSION` is a **required** build argument with no default. Pass the major from `node --version`:

```bash
NODE_MAJOR=$(node --version | sed 's/^v\([0-9]*\).*/\1/')
docker build --build-arg NODE_VERSION=$NODE_MAJOR -t payment-reminder-letters .
docker run -p 8080:8080 payment-reminder-letters
```

Or:

```bash
NODE_VERSION=$NODE_MAJOR docker compose up --build
```

Open http://localhost:8080/paymentreminders/

## Privacy

No accounts, cookies, localStorage, sessionStorage, IndexedDB, or service worker storage in Phase 1. No network calls from the calculator logic. Details save/load is a JSON file you choose.

## DEFAULTS (pending Jay)

See the open PR description for the numbered DEFAULTS 1-13.
