# Stylework

Initial monorepo for the Stylework Senior Full Stack Engineer assignment.

The scaffold includes a React frontend, an Express API, Prisma, and PostgreSQL. Business features and seed data are intentionally not included.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Prisma
- Database: PostgreSQL
- Tooling: ESLint, Prettier, Docker

## Prerequisites

- Node.js 22 or newer
- npm 10
- Docker with Compose

## Project layout

```text
frontend/          React application
  src/components   UI components
  src/pages        Screens
  src/lib          API client and config
backend/           Express API
  src/config       Environment validation
  src/routes       HTTP routes
  src/middleware   Shared Express middleware
  src/lib          Prisma client and logger
  src/modules      Feature modules (empty for now)
  prisma           Prisma schema
```

## Local setup

1. Install dependencies from the repository root:

```bash
npm install
```

2. Create environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env` points Prisma at PostgreSQL on `localhost`. The root `.env` supplies the same database name and credentials to Docker Compose. Keep those values aligned.

3. Start PostgreSQL:

```bash
docker compose up -d
```

4. Start the frontend and API:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Liveness: http://localhost:4000/health
- Readiness: http://localhost:4000/health/ready

The Vite dev server proxies `/api` to the API, so the page requests `/api/health` and `/api/health/ready`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and frontend |
| `npm run dev:backend` | Start the API only |
| `npm run dev:frontend` | Start the frontend only |
| `npm run lint` | Run ESLint in both packages |
| `npm run typecheck` | Run TypeScript in both packages |
| `npm run format` | Format the repository with Prettier |
| `npm run build` | Build both packages |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create and apply a migration once models exist |

## Docker application profile

`docker compose up -d` starts PostgreSQL only. To run the frontend and API in containers as well:

```bash
docker compose --profile app up --build
```

- Frontend: http://localhost:8080
- API: http://localhost:4000/health

Nginx serves the frontend and proxies `/api` to the backend container.

## Database

`backend/prisma/schema.prisma` defines `Lead` and `Activity`. Apply the migration after PostgreSQL is running:

```bash
npm run db:migrate
```
