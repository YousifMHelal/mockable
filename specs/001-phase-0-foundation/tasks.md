---

description: "Task list for Phase 0 — Foundation"
---

# Tasks: Phase 0 — Foundation

**Input**: Design documents from `/specs/001-phase-0-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated test suites are **out of scope** for Phase 0 (per spec — the empty
skeleton is verified by `next build`, `tsc --noEmit`, and `prisma migrate`). No test tasks
are generated; verification tasks stand in for them.

**Organization**: Tasks are grouped by user story. Stack is constitutionally fixed
(Principle I); paths follow the single Next.js full-stack project from plan.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3 (maps to spec.md user stories)

## Path Conventions

Single Next.js App Router project at repo root: `app/`, `lib/`, `prisma/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the deployable project shell every story builds on.

- [x] T001 Scaffold the app at repo root with `create-next-app` (App Router, TypeScript, Tailwind CSS, ESLint) — generates `app/`, `package.json`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`
- [x] T002 [P] Enforce strict TypeScript in `tsconfig.json` (`"strict": true`) per constitution Principle IV
- [x] T003 [P] Configure `.gitignore` to exclude `.env`, `.env*.local`, `node_modules`, `.next`
- [x] T004 [P] Define base scripts in `package.json` (`dev`, `build`, `start`, `lint`)

**Checkpoint**: `npm run dev` serves the default scaffold locally.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Environment-configuration contract shared by deploy (US1) and migrations (US2).

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [x] T005 Create `.env.example` (committed, secret-free) listing `DATABASE_URL` (pooled), `DIRECT_URL` (direct), `AUTH_SECRET`, and placeholders `VAPI_PRIVATE_KEY`, `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `LLM_API_KEY`; create local `.env` from it
- [x] T006 Add a fail-fast env access helper in `lib/env.ts` that reads required server vars and throws a clear error naming any missing variable (covers spec edge case "missing env configuration")

**Checkpoint**: Local `.env` populated; required-variable contract documented.

---

## Phase 3: User Story 1 - Deployable skeleton live on day one (Priority: P1) 🎯 MVP

**Goal**: An empty-but-running app deployed to Vercel, proving the build-and-deploy pipeline.

**Independent Test**: Push to the tracked branch → Vercel build succeeds → public URL renders the skeleton with no runtime errors.

### Implementation for User Story 1

- [x] T007 [US1] Implement root layout in `app/layout.tsx` (English/LTR `<html lang="en">`, base metadata, imports `globals.css`)
- [x] T008 [US1] Implement a placeholder landing page in `app/page.tsx` (minimal Mockable shell; replaced in Phase 7)
- [x] T009 [US1] Ensure `app/globals.css` imports Tailwind (`@import "tailwindcss";`)
- [x] T010 [US1] Verify the production build: `npm run build` and `npx tsc --noEmit` both pass with zero errors (SC-001)
- [ ] T011 [US1] Create/import the project on Vercel and set env vars (Project → Settings → Environment Variables) using the `.env.example` shape
- [ ] T012 [US1] Deploy from the tracked branch and confirm the public URL serves the skeleton without runtime errors (SC-002)

**Checkpoint**: MVP — the skeleton is live and continuously deployable.

---

## Phase 4: User Story 2 - Domain data model provisioned (Priority: P2)

**Goal**: The full domain schema committed and applied to Postgres via a first migration.

**Independent Test**: Run the migration against a fresh DB → all 6 tables + 4 enums created; generated client compiles.

### Implementation for User Story 2

- [x] T013 [US2] Install Prisma and adapter deps (`prisma`, `@prisma/client`, `@auth/prisma-adapter`); add `"postinstall": "prisma generate"` to `package.json`
- [x] T014 [US2] Initialize Prisma and configure `prisma/schema.prisma` datasource (`url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`) plus the `prisma-client` generator (clarified Q1; Prisma 6 uses `prisma.config.ts` for dual-URL)
- [x] T015 [US2] Define enums in `prisma/schema.prisma`: `InterviewStatus {CREATED IN_PROGRESS COMPLETED FAILED}`, `InterviewType {BEHAVIORAL TECHNICAL}`, `InterviewLanguage {ENGLISH ARABIC}`, `Difficulty {JUNIOR MID SENIOR}`
- [x] T016 [US2] Define Auth.js adapter models in `prisma/schema.prisma`: `User` (with nullable `passwordHash`), `Account`, `Session`, `VerificationToken` (clarified Q2)
- [x] T017 [US2] Define `Interview` and `Result` models in `prisma/schema.prisma` with relations, `userId` scoping (Principle XI), one-to-one `Result`↔`Interview`, and `@@index([userId])` per data-model.md
- [x] T018 [P] [US2] Create the `PrismaClient` singleton in `lib/prisma.ts` (guarded on `globalThis` to survive dev hot-reload)
- [x] T019 [US2] Run the first migration `npx prisma migrate dev --name init` against a fresh Postgres instance and commit `prisma/migrations/` (SC-003)
- [x] T020 [US2] Verify the generated client compiles (`npx tsc --noEmit`) and all 6 tables + 4 enums exist (`npx prisma studio` or a query)

**Checkpoint**: Schema is queryable and reproducible on any fresh DB.

---

## Phase 5: User Story 3 - Toolchain wired for development (Priority: P3)

**Goal**: Animation tooling installed and a documented, reproducible local setup.

**Independent Test**: Clean clone → `cp .env.example .env` → `npm install` → `npm run dev` renders styled output; GSAP importable; strict type-check active.

### Implementation for User Story 3

- [x] T021 [P] [US3] Install GSAP (`gsap`, `@gsap/react`)
- [x] T022 [US3] Add a smoke verification that Tailwind utility classes render and `gsap` imports/runs in a Client Component (e.g., a small client component on `app/page.tsx`); confirm `prefers-reduced-motion` is respected if any motion is added (Principle VIII)
- [x] T023 [P] [US3] Author `README.md` with setup steps, the env-var table, and migrate/run/deploy instructions (mirrors quickstart.md)
- [x] T024 [US3] Verify clean-clone onboarding end to end: fresh clone → copy env → `npm install` → `npm run dev` renders the styled skeleton with strict type-checking active, no undocumented steps (SC-004)

**Checkpoint**: A new developer can go clone → running app in under 15 minutes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final guarantees across all stories.

- [x] T025 [P] Confirm no secret is committed: only `.env.example` is tracked, `.env` is ignored (SC-005, Principle II)
- [x] T026 [P] Run the `quickstart.md` validation checklist end to end
- [x] T027 Verify `npx prisma migrate deploy` applies cleanly against the production database using `DIRECT_URL`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories.
- **User Stories (Phase 3–5)**: All depend on Foundational.
  - US1 (P1) is independent of US2/US3 — the empty skeleton deploys without the DB.
  - US2 (P2) and US3 (P3) are independent of each other.
- **Polish (Phase 6)**: Depends on the user stories it touches (US1 + US2 for T025–T027).

### User Story Dependencies

- **US1 (P1)**: After Foundational. No dependency on other stories.
- **US2 (P2)**: After Foundational. Independent of US1/US3.
- **US3 (P3)**: After Foundational. Independent; `gsap` install is standalone.

### Within User Story 2 (schema.prisma is one file)

- T014 → T015 → T016 → T017 are **sequential** (all edit `prisma/schema.prisma`).
- T018 (`lib/prisma.ts`) is [P] — different file.
- T019 (migration) requires T014–T017 complete; T020 requires T019.

### Parallel Opportunities

- Setup: T002, T003, T004 can run in parallel after T001.
- Foundational: T005 then T006 (T006 reads the var list T005 defines).
- US3: T021 and T023 can run in parallel.
- Polish: T025 and T026 can run in parallel.
- With multiple developers, US1 / US2 / US3 can proceed in parallel after Phase 2.

---

## Parallel Example: Setup (Phase 1)

```bash
# After T001 scaffolds the project, run in parallel:
Task: "Enforce strict TypeScript in tsconfig.json"
Task: "Configure .gitignore to exclude .env, node_modules, .next"
Task: "Define base scripts in package.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup → 2. Phase 2: Foundational → 3. Phase 3: US1.
4. **STOP and VALIDATE**: skeleton builds and is live on Vercel — this satisfies the
   roadmap's "deploy from day one" and is a demoable MVP.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → deployable skeleton live (MVP).
3. US2 → schema migrated on a fresh DB.
4. US3 → documented, reproducible dev setup.
5. Polish → secret/quickstart/prod-migration guarantees.

### Phase 0 "Done when" (roadmap)

App builds, deploys (US1), and `prisma migrate` succeeds (US2) — both covered before Polish.

---

## Notes

- [P] = different files, no dependencies. The four `schema.prisma` edits (T014–T017) are
  intentionally **not** [P] — same file.
- No automated test tasks: Phase 0 acceptance is build + type-check + migration success.
- Commit after each task or logical group (git hooks available via Spec Kit).
- The stack and all enum/schema decisions are fixed by the constitution + clarifications;
  do not substitute libraries (Principle I).
