# Stylework Lead Intake

A lead intake service for the Stylework Senior Full Stack Engineer assignment. A Meta Ads webhook creates leads, every change is stored as an activity, and the React app lists and reviews those leads.

## Architecture

The repository is an npm workspace with two applications and one database.

```text
frontend/     React, TypeScript, Vite, Tailwind
backend/      Express, TypeScript, Prisma
postgres      PostgreSQL 16, started with Docker Compose
```

HTTP requests enter Express through Helmet, CORS, JSON parsing, and request logging. Routes validate query, params, and body with Zod, then call a service. Services own transactions and audit writes. Controllers only translate the service result into a response. Unexpected errors are converted to a short JSON message. Stack traces stay in the server log.

The audit trail is append-only. Creating a lead writes `LEAD_CREATED`. Changing contact details writes `LEAD_UPDATED` with the previous and next values. Changing status writes `STATUS_CHANGED` with both statuses. If a request does not actually change anything, no activity is written.

The frontend talks to the API through `frontend/src/lib/api`. Pages own loading, error, and empty states. Lead list and detail rendering stay in feature components.

## Setup

Requirements: Node.js 22, npm 10, and Docker.

```bash
npm install
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d
npm run db:migrate
npm run dev
```

- App: http://localhost:5173
- API health: http://localhost:4000/health

`backend/.env` must use the same database name and password as the root `.env`. If port 5432 is already taken on your machine, set `POSTGRES_PORT` in the root `.env` and point `DATABASE_URL` at that port.

Create a lead:

```bash
curl -X POST http://127.0.0.1:4000/webhook/meta-lead \
  -H 'content-type: application/json' \
  -d '{"externalLeadId":"lead-1","name":"Ada Lovelace","email":"ada@example.com","phone":"+15551212","source":"meta"}'
```

Then reload the app.

## API

| Method | Path | Result |
| --- | --- | --- |
| POST | `/webhook/meta-lead` | 201 created, 400 invalid, 409 duplicate, 429 rate limited |
| GET | `/leads?page&limit` | Newest leads first, with `data`, `page`, `limit`, and `total` |
| GET | `/leads/:id` | Lead plus activities, newest first |
| PATCH | `/leads/:id` | Update name, email, or phone |
| PATCH | `/leads/:id/status` | Update status |

## Tests

```bash
npm test -w backend
```

## Deployment

PostgreSQL alone:

```bash
docker compose up -d
```

API and frontend containers, with Postgres:

```bash
docker compose --profile app up --build
```

- Frontend: http://localhost:8080
- API: http://localhost:4000/health

The frontend image is a static Nginx build. `/api` is proxied to the backend container. The backend image runs the compiled Express server and connects with `DATABASE_URL`.

A public URL is not included in this repository. Publish the `app` Compose profile, or the built images, to the host you use for review and put that URL here before submitting:

```text
Live app: <add the deployed URL>
```

Do not commit real production passwords. Set `DATABASE_URL`, `CORS_ORIGIN`, and `POSTGRES_PASSWORD` in the host environment.

## Trade-offs

- One activity row per successful change keeps the audit query simple. It does not model a general event bus.
- Duplicate webhooks return 409 from the unique `externalLeadId` constraint inside the transaction, instead of silently returning the old lead. Callers can see that the lead already existed.
- The webhook payload is a direct lead object, not Meta's nested leadgen envelope. The intake boundary stays small and testable. A Meta-specific adapter can sit in front of it later.
- Pagination is offset-based. It is easy to explain and fine at this size. Keyset pagination is a better fit if the list grows large.
- Rate limiting is in-memory and applies only to the webhook. It resets when the process restarts and does not coordinate across multiple instances.

## Scaling

- Run more than one API container behind a load balancer. Move the webhook rate limit to a shared store such as Redis.
- Keep the audit table append-only and index `(lead_id, created_at)`, which is already in place.
- Read the lead list from a replica once write traffic and reporting diverge.
- Replace offset pagination with a cursor on `created_at` and `id` before the table is large enough for deep pages to get slow.

## Future improvements

- Verify a Meta webhook signature before accepting a lead.
- Map Meta's leadgen payload into the current create-lead command.
- Add filters for status and source on the list.
- Export the audit trail.
- Add a shared package for the lead types used by both apps.
