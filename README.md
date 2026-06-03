# Mockable

AI-powered voice mock interviews with instant scored feedback.

> Phase 0 — Foundation: deployable skeleton, domain schema, toolchain wired.

## Stack

Next.js 15 (App Router) · TypeScript 5 (strict) · Tailwind CSS v4 · GSAP 3 · Prisma 6 · PostgreSQL · Auth.js v5 · Vapi · Vercel

---

## Local setup

### Prerequisites

- Node.js 20 LTS
- PostgreSQL with **two** connection strings (pooled + direct)
  — e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or local Docker:
  ```bash
  docker run -d --name mockable-pg \
    -e POSTGRES_USER=mockable -e POSTGRES_PASSWORD=mockable -e POSTGRES_DB=mockable \
    -p 5432:5432 postgres:16-alpine
  ```

### 1. Install

```bash
npm install        # postinstall runs `prisma generate`
cp .env.example .env
```

Fill in `.env` — see [Environment variables](#environment-variables) below.

### 2. Migrate

```bash
npx prisma migrate dev --name init
```

Creates 6 tables (`User`, `Account`, `Session`, `VerificationToken`, `Interview`, `Result`) and 4 enums.

### 3. Run

```bash
npm run dev        # http://localhost:3000
```

### 4. Verify

```bash
npx tsc --noEmit   # zero type errors (strict mode)
npm run build      # production build, zero errors
```

---

## Environment variables

| Variable | Purpose | Exposed to browser? |
|---|---|---|
| `DATABASE_URL` | Pooled connection — app runtime | No |
| `DIRECT_URL` | Direct connection — migrations | No |
| `AUTH_SECRET` | Auth.js signing secret | No |
| `VAPI_PRIVATE_KEY` | Vapi server key (Phase 4) | No |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Vapi public key (Phase 4) | **Yes** (safe) |
| `LLM_API_KEY` | Scoring LLM key (Phase 5) | No |

Copy `.env.example` → `.env` and fill in real values. **Never commit `.env`.**

---

## Deploy to Vercel

1. Import the repo in [Vercel](https://vercel.com).
2. Add env vars under **Project → Settings → Environment Variables**.
3. Push to the tracked branch — Vercel builds and serves the skeleton automatically.

> **Production migrations**: run `npx prisma migrate deploy` (using `DIRECT_URL`) in the Vercel build step or as a one-off command.

---

## Project structure

```
app/            Next.js App Router pages + layouts
components/     Shared React components
lib/            Server-side helpers (prisma singleton, env validation)
prisma/
  schema.prisma         Domain schema (6 models, 4 enums)
  migrations/           Committed migration history
.env.example            Secret-free env template (committed)
```
