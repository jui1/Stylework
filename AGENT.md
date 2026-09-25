# AGENT.md

This file records how AI assistance was used on the Stylework lead intake assignment.

## Tools

- Cursor, with Grok as the coding agent in this session.
- The agent used the local workspace, npm, Prisma, Docker, and the in-editor browser to run and check the app.
- No separate code-generation service was used outside Cursor.

## Prompts that drove the work

The implementation followed the assignment brief and these follow-up requests from the same session:

- Scaffold a React, TypeScript, Vite, Express, Prisma, PostgreSQL, Tailwind, and Docker monorepo without business logic.
- Add the Lead and Activity Prisma models and migration.
- Implement `POST /webhook/meta-lead` with Zod, a transaction, duplicate handling, and tests.
- Implement paginated `GET /leads`.
- Implement `GET /leads/:id` with the activity timeline.
- Implement `PATCH /leads/:id/status` with a `STATUS_CHANGED` activity.
- Review the backend for production readiness: error handling, validation, logging, CORS, Helmet, webhook rate limiting, shutdown, and environment validation.
- Build the React architecture: routing, an API layer, shared loading, error, and empty states, plus list and detail pages.
- Finish the assignment: lead-update audit events, detail-page actions, styling, this file, and the README.

## What the agent generated

- Project scaffold, Docker Compose, Prisma schema, and migrations.
- Express modules for webhook intake, lead queries, status changes, and contact updates.
- Backend tests under `backend/src`.
- The React routes, API client, lead pages, and the current layout styling.
- README sections for architecture, setup, deployment, trade-offs, scaling, and future work.
- This document.

## What was decided or corrected by hand in the session

- TypeScript 6 config errors (`baseUrl` removed, relative `paths`, explicit `include` globs) were fixed after the editor reported them.
- Local PostgreSQL was already bound to ports 5432 and 5433, so the uncommitted local `.env` uses port 5434. The examples still document 5432.
- The first Prisma install resolved to a Prisma 8 pre-release whose CLI could not run `generate`. The project was pinned to Prisma 6.19.3.
- A sample lead created only to click through the UI was deleted afterward. The database is not seeded.

## Architecture decisions

- Services own transactions and the decision to append an activity. Controllers stay thin.
- The audit log is a table of activities, not an event bus. That matches the read pattern: one lead, newest activity first.
- Unchanged status or contact updates do not write a row. The trail records real changes only.
- `externalLeadId` is unique. A duplicate webhook rolls the transaction back and returns 409.
- Validation errors return 400 with field details. Unexpected errors return a fixed message and no stack trace.
- The frontend does not assemble SQL or Prisma types. It calls the HTTP API and renders the JSON contract in `frontend/src/types/lead.ts`.
