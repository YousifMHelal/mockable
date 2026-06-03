# Implementation Plan: Phase 0 — Foundation

**Branch**: `001-phase-0-foundation` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-phase-0-foundation/spec.md`

## Summary

Stand up a deployable Next.js (App Router) + TypeScript skeleton with the full
constitution-mandated toolchain wired: strict TypeScript, Tailwind CSS, GSAP, Prisma over
Postgres, and a Vercel deployment proven from day one. Ship the domain data model
(Auth.js adapter entities + Interview + Result + enums) and run a first migration against a
real Postgres instance. No product features — this is the foundation every later phase
builds on.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20 LTS (Vercel default runtime)

**Primary Dependencies**: Next.js 15 (App Router, React 19), Tailwind CSS v4, GSAP 3.x,
Prisma 6.x (`@prisma/client`), `@auth/prisma-adapter` (schema only this phase; Auth.js v5
wiring lands in Phase 2)

**Storage**: PostgreSQL via Prisma. Two connection URLs (per clarification): pooled
`DATABASE_URL` for runtime, `DIRECT_URL` for migrations.

**Testing**: Build-and-migrate verification this phase (`next build`, `tsc --noEmit`,
`prisma migrate`); no unit test suite required for an empty skeleton. A type-check + build
gate is the acceptance test.

**Target Platform**: Vercel (production web), modern browsers. Local dev on Node 20.

**Project Type**: Web application (Next.js full-stack, single project)

**Performance Goals**: N/A for the empty skeleton beyond a successful build; landing-page
Lighthouse targets are Phase 7. Build must complete within Vercel's standard build window.

**Constraints**: Stack is constitutionally fixed (Principle I — no alternative
framework/ORM/auth). No secrets in the client bundle (Principle II). Strict TS, no
unjustified `any` (Principle IV).

**Scale/Scope**: Foundation only — empty deployable shell + 6 entities + enums + 1
migration. Single production environment.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Relevance to this phase | Status |
|-----------|------------------------|--------|
| I. Fixed Stack | This phase *installs* the fixed stack exactly; no alternatives introduced | ✅ PASS |
| II. No Secrets in Browser | `.env` git-ignored; `.env.example` secret-free; no secret read client-side | ✅ PASS |
| III. Live vs. Evaluation | No Vapi/LLM code yet; schema keeps `transcript` and `Result` separate | ✅ PASS (N/A code) |
| IV. Type Safety | `strict: true` in tsconfig; Prisma client is the typed data source | ✅ PASS |
| V. Idiomatic React/TS | App Router, Server Components by default in the skeleton | ✅ PASS |
| VI. English/LTR app | Skeleton page is English/LTR; no i18n introduced | ✅ PASS |
| VII–IX. Design/A11y/Perf | No UI beyond a placeholder page; obligations defer to Phases 4–8 | ✅ N/A this phase |
| X. Security | `User.passwordHash` field reserved for bcrypt/argon2 (Phase 2 hashes it); JWT session strategy is the documented plan | ✅ PASS |
| XI. User-Owned Data | Every domain row (`Interview`, `Result`) carries a `userId`/owning FK for query scoping | ✅ PASS |

**Result**: No violations. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-phase-0-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output — stack version + connection-model decisions
├── data-model.md        # Phase 1 output — Prisma schema (entities, enums, relations)
├── quickstart.md        # Phase 1 output — clone → migrate → run → deploy
├── contracts/           # Phase 1 output — see note below
└── checklists/
    └── requirements.md  # Spec quality checklist (from /speckit-specify)
```

**Contracts note**: Phase 0 exposes **no external API/CLI/UI contract** (empty skeleton,
no routes). The closest contract is the database schema, which is captured fully in
`data-model.md` and the Prisma migration. `contracts/` therefore holds only a short
`README.md` stating "no external interfaces in Phase 0; the Prisma schema in
../data-model.md is the data contract."

### Source Code (repository root)

```text
mockable/
├── app/
│   ├── layout.tsx          # Root layout (English/LTR, imports globals.css)
│   ├── page.tsx            # Placeholder skeleton landing (replaced in Phase 7)
│   └── globals.css         # Tailwind v4 entry (@import "tailwindcss")
├── lib/
│   └── prisma.ts           # Singleton PrismaClient (avoids dev hot-reload exhaustion)
├── prisma/
│   ├── schema.prisma       # datasource (url=DATABASE_URL, directUrl=DIRECT_URL) + models
│   └── migrations/         # First migration committed
├── .env                    # git-ignored, real secrets (local)
├── .env.example            # committed, secret-free, all required vars
├── .gitignore              # ignores .env, node_modules, .next
├── next.config.ts
├── tsconfig.json           # strict: true
├── postcss.config.mjs      # Tailwind v4 / PostCSS
├── package.json            # scripts: dev, build, postinstall (prisma generate)
└── README.md               # setup + env + deploy notes
```

**Structure Decision**: Single Next.js full-stack project (App Router). No separate
backend — server actions/route handlers live inside `app/`. This matches the fixed stack
and the roadmap, which treats the whole product as one Next.js app deployed to Vercel.

## Complexity Tracking

> No constitution violations — section intentionally empty.
