# Phase 0 Research: Foundation

All major technology choices are fixed by the constitution (Principle I — Fixed Stack), so
research focuses on **versions**, **configuration patterns**, and the decisions the spec's
clarification session locked in. No `NEEDS CLARIFICATION` items remain.

## Decision 1 — Framework & language versions

- **Decision**: Next.js 15 (App Router, React 19), TypeScript 5.x in `strict` mode, Node 20
  LTS (Vercel's standard runtime).
- **Rationale**: Current stable line; App Router is the constitution's mandated mode and the
  default for `create-next-app`. Strict TS satisfies Principle IV.
- **Alternatives considered**: Pages Router (rejected — constitution mandates App Router);
  older Next 14 (rejected — no reason to start behind current stable).

## Decision 2 — Styling: Tailwind CSS v4

- **Decision**: Tailwind CSS v4 via the PostCSS plugin, single `globals.css` using
  `@import "tailwindcss"`.
- **Rationale**: v4 is the current major; zero-config content detection removes the
  `tailwind.config` content-globbing step. Matches "Tailwind for styling" mandate.
- **Alternatives considered**: Tailwind v3 with explicit config (acceptable but older);
  CSS Modules / styled-components (rejected — constitution fixes Tailwind).

## Decision 3 — Animation: GSAP

- **Decision**: Install `gsap` 3.x now; import-only verification this phase (no real
  animation until Phase 4/7). Plan to use the `@gsap/react` `useGSAP` hook for React
  integration later.
- **Rationale**: Roadmap requires GSAP installed in Phase 0 so the dependency and bundling
  are proven early. Animations themselves are later phases.
- **Alternatives considered**: Framer Motion (rejected — constitution names GSAP).

## Decision 4 — ORM & database: Prisma + Postgres, dual connection URLs

- **Decision**: Prisma 6.x. `schema.prisma` datasource uses `url = env("DATABASE_URL")`
  (pooled, runtime) and `directUrl = env("DIRECT_URL")` (direct, migrations).
- **Rationale**: **Locked by clarification (Q1 → A).** On Vercel's serverless runtime,
  per-invocation connections exhaust a Postgres connection limit; a pooled URL (PgBouncer /
  provider pooler) is required for runtime, while `prisma migrate` needs a direct connection
  because DDL fails over a transaction-mode pooler. The `directUrl` datasource field is
  Prisma's first-class mechanism for exactly this split.
- **Implementation note**: A singleton `PrismaClient` in `lib/prisma.ts` guarded on
  `globalThis` prevents client proliferation during dev hot-reload.
- **Alternatives considered**: Single direct URL (rejected — serverless connection
  exhaustion); single pooled URL (rejected — migrations break over the pooler). See spec
  Clarifications.

## Decision 5 — Auth data model scope (schema only this phase)

- **Decision**: Commit the **full Auth.js Prisma-adapter schema** — `User`, `Account`,
  `Session`, `VerificationToken` — plus a `passwordHash` field on `User` for the credentials
  provider. **Locked by clarification (Q2 → A).**
- **Rationale**: Including the complete adapter schema now keeps the database
  adapter-compatible and avoids a disruptive migration if OAuth or DB sessions are ever
  added. Under the constitution's JWT session strategy, `Session`/`VerificationToken` simply
  stay empty. Auth.js *runtime* wiring (provider, callbacks, hashing) is **Phase 2**, not
  this phase — Phase 0 only lands the tables.
- **Alternatives considered**: Minimal User+Account, or User-only (both rejected in Q2 —
  later schema churn outweighs the near-zero cost of empty tables).

## Decision 6 — Interview status enumeration

- **Decision**: `InterviewStatus = { CREATED, IN_PROGRESS, COMPLETED, FAILED }`. **Locked by
  clarification (Q3 → B).**
- **Rationale**: Happy path plus a terminal `FAILED` state for dropped Vapi calls or scoring
  errors, so a broken interview is never stuck looking `IN_PROGRESS`. Defining it now avoids
  an enum migration when Phases 4–5 use it.
- **Alternatives considered**: Three happy-path states only (rejected — no failure state);
  adding `CANCELLED` (deferred — user-cancel vs system-fail distinction not needed yet).

## Decision 7 — Configuration enums (initial values)

- **Decision**: Define `InterviewType`, `InterviewLanguage`, and `Difficulty` enums now with
  sensible initial values; `Interview.field` is a nullable string used only for `TECHNICAL`.
  - `InterviewType { BEHAVIORAL, TECHNICAL }`
  - `InterviewLanguage { ENGLISH, ARABIC }`
  - `Difficulty { JUNIOR, MID, SENIOR }`
- **Rationale**: The migration needs concrete enum values to exist. `InterviewLanguage` is
  firm (constitution Principle VI fixes EN/AR voice). Type/Difficulty values are a reasonable
  starting set; the create-interview UI (Phase 3) may expand them via a follow-up migration —
  acceptable because the spec scopes final value lists to later refinement.
- **Alternatives considered**: Free-text columns instead of enums (rejected — loses DB-level
  validation and type safety, Principle IV).

## Decision 8 — Deployment & environment management

- **Decision**: Deploy the skeleton to Vercel from the tracked branch. `.env` is git-ignored;
  `.env.example` is committed and secret-free, listing `DATABASE_URL`, `DIRECT_URL`,
  `AUTH_SECRET`, and placeholder keys for later phases (`VAPI_PRIVATE_KEY`,
  `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, LLM API key). Postgres provider is any Vercel-compatible
  managed Postgres exposing both a pooled and a direct connection string (e.g. Neon / Vercel
  Postgres / Supabase).
- **Rationale**: Satisfies "deploy from day one" and Principle II (only the `NEXT_PUBLIC_`
  Vapi key is ever client-exposed; everything else is server-side). Documenting placeholder
  keys now fixes the env *shape* for later phases.
- **Alternatives considered**: Defer deploy until a feature exists (rejected — roadmap
  explicitly de-risks the pipeline in Phase 0).
