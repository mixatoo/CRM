# Egyliere OPs

Production-grade luxury travel operations CRM built with React 19, TypeScript, Vite, and Tailwind CSS v4.

## Features

- **Service-centric orders** — Order → OrderServices with typed payloads (flight, airport, transport, hotel, tour, guide, etc.)
- **Executive dashboard** — Role-aware KPIs, arrivals/departures, attention queue, charts
- **Directories** — Passengers, guides, drivers, hotels, suppliers, and more (RBAC-guarded CRUD)
- **Finance** — Expenses, invoices (draft → pending → sent), payments with RBAC
- **Reports** — Daily ops, airport, transport, revenue with multi-currency conversion
- **Automation** — Workflow rules, notification/order template CRUD
- **Admin** — Users, labels, exchange rates, custom fields, session timeout
- **Offline-first** — IndexedDB persistence with repository pattern (API-ready)
- **RBAC** — Admin, Operations, Finance, Sales, Management, ReadOnly, Guest

## Important limitations (SPA demo)

This build is a **client-side SPA** using IndexedDB. It is suitable for demos and single-browser operations workflows.

- **Authentication is demo-only** (localStorage, hardcoded accounts) — not production auth
- **No backend API** — sync outbox processes locally; no multi-user server sync
- **No multi-tenant** — single organization per browser profile
- For production deployment, implement a REST API + real auth (repositories are API-ready)

## Quick start

```bash
cd egyliere-ops
npm install
npm run dev
```

Open http://localhost:5173

### Demo login

| Email | Password | Role |
|---|---|---|
| admin@egyliere.com | admin | Admin |
| ops@egyliere.com | ops | Operations |
| finance@egyliere.com | finance | Finance |
| sales@egyliere.com | sales | Sales |
| mgmt@egyliere.com | mgmt | Management |
| readonly@egyliere.com | readonly | ReadOnly |
| guest@egyliere.com | guest | Guest (masked PII) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:coverage` | Unit tests with coverage |
| `npm run test:e2e` | E2E tests (Playwright) |
| `npm run lint` | ESLint |

## Architecture

```
src/
├── app/              # Shell, router, DI container
├── design-system/    # Tokens + UI components
├── features/         # Feature modules (UI)
├── application/      # Use cases, event handlers
├── domain/           # Entities, schemas, policies, services
├── repositories/     # Repository interfaces + Dexie implementations
├── infrastructure/   # Database, seed, export
└── shared/           # Utils, stores, keyboard registry
```

All mutations flow through `application/use-cases` with `guardActor` RBAC enforcement.

## Docker

```bash
docker build -f docker/Dockerfile -t egyliere-ops .
docker run -p 8080:80 egyliere-ops
```
