<!--
  Copyright (c) 2026 Advanced Software and AI Solutions LLC. All rights reserved.
-->

# Agent guidance

## Stack

Vite, React 19, TypeScript, MUI with emotion, bundled IBM Plex fonts, Vitest, Testing Library, jsdom, ESLint, Prettier. Static build, no server, no router.

## Node

Do not enforce, pin, or change the Node version. No `engines` field, no `.nvmrc`. Docker `NODE_VERSION` is a required build ARG with no pinned default.

## Privacy and safety

No localStorage, sessionStorage, IndexedDB, cookies, or service worker storage. No secrets in the repo. No em or en dashes (`npm run lint:copy`). Keep `src/lib` free of React.

## Print / PDF

Reuse [`src/components/print/ReportPrint/`](src/components/print/ReportPrint/) and [`src/components/report/printSession.ts`](src/components/report/printSession.ts). LetterPrint for this tool is wired in PR 2. Browser print + CSS only.

## CSP

One source: [`scripts/csp.mjs`](scripts/csp.mjs). Must match `index.html` (via Vite `__CSP__` inject), `public/.htaccess`, and `nginx/default.conf`.
