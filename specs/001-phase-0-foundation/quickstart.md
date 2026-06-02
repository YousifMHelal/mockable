# Phase 0 Quickstart

Goal: from a clean clone to a running app and a successful deploy. Maps to spec
SC-004 (clone → run in under 15 min) and the "Done when" criteria (builds, deploys,
`prisma migrate` succeeds).

## Prerequisites

- Node.js 20 LTS + npm
- A PostgreSQL database exposing **two** connection strings: a pooled URL and a direct URL
  (e.g. Neon, Vercel Postgres, or Supabase — all provide both)
- A Vercel account (for deploy verification)

## 1. Install & configure

```bash
npm install                 # postinstall runs `prisma generate`
cp .env.example .env        # then fill in real values
```

Required in `.env` (none of these are ever exposed client-side except the `NEXT_PUBLIC_` one):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled connection — app runtime |
| `DIRECT_URL` | Direct connection — migrations |
| `AUTH_SECRET` | Auth.js secret (used from Phase 2; set now) |
| `VAPI_PRIVATE_KEY` | Placeholder — Phase 4 |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Placeholder — Phase 4 (only client-exposed key) |
| `LLM_API_KEY` | Placeholder — Phase 5 |

## 2. Apply the first migration

```bash
npx prisma migrate dev --name init     # creates tables + enums via DIRECT_URL
npx prisma studio                       # optional: confirm tables exist
```

Expect tables: `User`, `Account`, `Session`, `VerificationToken`, `Interview`, `Result`
and enums `InterviewStatus`, `InterviewType`, `InterviewLanguage`, `Difficulty`.

## 3. Run locally

```bash
npm run dev      # http://localhost:3000 — placeholder skeleton, Tailwind styling applies
```

## 4. Verify the gates (acceptance)

```bash
npx tsc --noEmit     # SC-001: zero type errors (strict mode)
npm run build        # SC-001: production build, zero errors
```

## 5. Deploy to Vercel

1. Import the repo in Vercel.
2. Add the same env vars (Project → Settings → Environment Variables).
3. Push to the deployment-tracked branch → Vercel builds and serves the skeleton (SC-002).
4. Confirm the public URL renders without runtime errors.

> Production migrations run via `prisma migrate deploy` (e.g. in the build step or a
> one-off), using `DIRECT_URL`.

## Done checklist

- [ ] `npm run build` and `tsc --noEmit` pass with zero errors
- [ ] `prisma migrate` created all 6 tables + 4 enums on a fresh DB
- [ ] App runs locally with Tailwind styling and GSAP importable
- [ ] Skeleton is live on a public Vercel URL
- [ ] No secret committed — only `.env.example` is in version control
