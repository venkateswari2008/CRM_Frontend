# CRM Frontend (Angular 21)

Single-page application for the Cognizant *Upgrade to Architect* CRM case study.

Standalone components, signals, Angular Material 21, Chart.js, JWT-based auth
with HTTP interceptors and route guards. Talks to the
[CRM backend API](https://github.com/venkateswari2008/CRM_Backend).

## Tech stack

- **Angular 21** (standalone components, signals, zoneless change detection)
- **Angular Material 21** + CDK
- **Chart.js + ng2-charts** for the dashboard line chart
- **RxJS 7** for HTTP + form streams
- **Self-hosted Roboto + Material Icons** (no external CDN, works offline)

## Prerequisites

- Node.js **20+** (project is built with 22.x)
- npm **10+** (the bundled CLI is installed via `npm install -g @angular/cli`)

## Quick start

```bash
npm install
npm start              # ng serve, http://localhost:4200
```

The dev server proxies `/api/*` to the backend (default `http://localhost:5171`).
Override that in [`proxy.conf.json`](proxy.conf.json) or add a
`proxy.local.conf.json` (git-ignored).

### Seeded backend users for first sign-in

| Username    | Password       | Role  |
|-------------|----------------|-------|
| `admin`     | `ChangeMe!123` | Admin |
| `demo.user` | `ChangeMe!123` | User  |

## Project layout

```
src/
├── app/
│   ├── core/                  Singletons: auth service, interceptors, guards, models
│   │   ├── auth/
│   │   ├── http/
│   │   └── models/
│   ├── features/
│   │   ├── auth/              Login, Signup, Forbidden
│   │   ├── customers/         List + create/edit dialog
│   │   ├── sales/             List, create/edit dialog, CSV export
│   │   └── dashboard/         KPI cards + Chart.js sales chart + breakdowns
│   └── shared/
│       ├── shell/             Top toolbar + sidenav layout
│       └── confirm-dialog/
├── environments/              environment.ts (prod) + environment.development.ts
└── styles.scss                Global tokens + Material theme overrides
```

Each feature module is **lazy-loaded** so the initial bundle stays small (~120 kB
in dev, ~160 kB main + 1.3 MB vendor in prod).

## Common scripts

```bash
npm start                 # dev server with proxy
npm run build             # production build (dist/crm-web)
npm test                  # vitest run
ng lint                   # if you add @angular-eslint
```

## Configuration

| Setting        | Where                                              | Notes |
|----------------|----------------------------------------------------|-------|
| API base URL   | [`src/environments/environment*.ts`](src/environments) | `/api` in dev (proxied), absolute URL in prod |
| Dev proxy      | [`proxy.conf.json`](proxy.conf.json)               | Forwards `/api` + `/health` to backend |
| Material theme | [`angular.json` > styles](angular.json)            | Uses `@angular/material/prebuilt-themes/indigo-pink.css` |

## Auth flow

1. User signs in &rarr; `POST /api/auth/login` &rarr; JWT + user payload returned
2. `AuthService` writes the payload into `localStorage` (TTL-checked) and a
   reactive `signal`
3. `authInterceptor` adds `Authorization: Bearer <token>` to every outgoing
   request
4. `errorInterceptor` watches for `401` and forces a logout + redirect
5. `authGuard` / `roleGuard` protect routes; lazy chunks won't even load
   without a token

## Building for production

```bash
npm run build
# output: dist/crm-web/ (static files)
```

Serve `dist/crm-web/` from any static host (Azure Static Web Apps, Nginx,
S3 + CloudFront, etc.) and point `environment.ts`'s `apiBaseUrl` at the
real API origin.

## Linked repositories

- **API:** <https://github.com/venkateswari2008/CRM_Backend>

## License

Internal Cognizant case-study project &mdash; not for redistribution.
