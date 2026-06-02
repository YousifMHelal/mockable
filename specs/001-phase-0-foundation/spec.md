# Feature Specification: Phase 0 — Foundation

**Feature Branch**: `001-phase-0-foundation`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "phase 0  mockable-roadmap.md"

## Overview

Phase 0 establishes a deployable project skeleton with the full toolchain wired so that
every later phase builds on a proven pipeline. There is no end-user-facing feature yet;
the beneficiaries of this phase are the development team and the delivery pipeline. The
goal is to remove all foundational risk — "does it build, does it deploy, does the
database migrate" — before any product feature is written.

The technology choices named here (Next.js App Router + TypeScript, Tailwind, GSAP,
Prisma over Postgres, Vercel) are not open decisions: they are fixed by the project
constitution (Principle I — Fixed Stack). They appear in this spec as constraints, not
as implementation proposals.

## Clarifications

### Session 2026-06-03

- Q: Database connection model for Prisma on Vercel serverless? → A: Two URLs — pooled
  `DATABASE_URL` for runtime + separate `DIRECT_URL` for migrations.
- Q: Which auth tables should the first migration create, given JWT (not DB) sessions? →
  A: Full Auth.js adapter schema — User, Account, Session, VerificationToken (Session and
  VerificationToken stay empty under JWT but keep the schema adapter-compatible).
- Q: What is the full interview status enumeration value set? → A: `CREATED, IN_PROGRESS,
  COMPLETED, FAILED` — happy path plus a terminal `FAILED` state for dropped calls or
  scoring errors.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deployable skeleton live on day one (Priority: P1)

As the development team, we need an empty-but-running application deployed to the
production host from the very first day, so that the build-and-deploy pipeline is proven
before any feature depends on it.

**Why this priority**: De-risking the pipeline early is the single highest-value outcome
of this phase. If deployment is broken, nothing else can ship. Proving it on an empty
skeleton makes the first real feature a low-risk increment instead of a
deploy-debugging exercise.

**Independent Test**: Trigger a deployment from the main line of work and confirm the
hosted URL serves the running skeleton without errors. Delivers value on its own: a
working, continuously deployable app shell.

**Acceptance Scenarios**:

1. **Given** the project repository, **When** the project is built locally, **Then** the
   build completes with no errors and no type errors.
2. **Given** a push to the deployment-tracked branch, **When** the host runs its build,
   **Then** the deployment succeeds and the skeleton is reachable at a public URL.
3. **Given** the deployed skeleton, **When** a visitor loads the URL, **Then** a page
   renders without runtime errors.

---

### User Story 2 - Domain data model provisioned (Priority: P2)

As the development team, we need the project's data model defined and applied to a real
database via a first migration, so that later phases (auth, interviews, scoring) have the
tables and relationships they depend on.

**Why this priority**: The data model is the backbone every subsequent phase writes
against. Committing it and proving the migration runs against a real Postgres instance
removes schema-and-connection risk early. It is P2 because a deployable shell (P1) can
exist before the database is wired, but no data-bearing feature can.

**Independent Test**: Run the migration against a fresh database and confirm all expected
tables and enums are created and the generated data-access client compiles. Delivers
value on its own: a queryable schema ready for features.

**Acceptance Scenarios**:

1. **Given** the committed schema, **When** the first migration is applied to a fresh
   Postgres database, **Then** the migration succeeds and creates tables for User,
   Account, Session, VerificationToken, Interview, and Result plus their enums.
2. **Given** an applied migration, **When** the data-access client is generated, **Then**
   it compiles and exposes typed models for every entity.
3. **Given** the migration history, **When** a teammate applies migrations to their own
   fresh database, **Then** they reach an identical schema state.

---

### User Story 3 - Toolchain wired for development (Priority: P3)

As a developer joining the project, I need the styling, animation, type-safety, and
environment-configuration tooling already installed and documented, so that I can clone
the repository and start developing without reconstructing the setup.

**Why this priority**: This is a developer-experience and consistency outcome. The app
can technically build (P1) and migrate (P2) before every convenience is polished, but a
documented, reproducible local setup prevents drift and onboarding friction. P3 because
it is the least blocking of the three.

**Independent Test**: On a clean clone, copy the example environment file, install
dependencies, and start the dev server; confirm styling renders, the animation library
is importable, and strict type-checking is active. Delivers value on its own: a
reproducible local environment.

**Acceptance Scenarios**:

1. **Given** a clean clone, **When** a developer copies the example environment file and
   fills in values, **Then** the application starts locally without missing-configuration
   errors.
2. **Given** the running local app, **When** a developer adds a styled element and an
   animation, **Then** the styling utility classes apply and the animation library is
   importable and runs.
3. **Given** the codebase, **When** type-checking runs, **Then** it runs in strict mode
   and fails on untyped or unsafe code.

---

### Edge Cases

- **Missing or incomplete environment configuration**: the app must fail fast with a
  clear indication of which required variable is absent, rather than failing silently or
  leaking a default secret.
- **Migration applied to a non-empty or drifted database**: the migration must not
  silently corrupt or partially apply; a drift or conflict must surface as an explicit
  error.
- **Deployment build failure**: a failed hosted build must not replace the previously
  working deployment; the prior version stays live.
- **Secret values committed by mistake**: the real environment file must be excluded from
  version control; only the example (secret-free) file is committed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST build to a production bundle with zero build errors and
  zero type errors.
- **FR-002**: Type-checking MUST run in strict mode and reject untyped/unsafe code.
- **FR-003**: The project MUST deploy successfully to the production host from a
  repository push, producing a publicly reachable running skeleton.
- **FR-004**: The repository MUST define a data model covering the entities User, Account,
  Session, VerificationToken, Interview, and Result, together with the enumerations they
  require (including an interview status enumeration). The User/Account/Session/
  VerificationToken set MUST match the Auth.js Prisma-adapter schema so it is
  adapter-compatible, even though JWT sessions leave Session and VerificationToken unused.
- **FR-005**: A first database migration MUST apply cleanly against a fresh Postgres
  instance and create all defined tables, relationships, and enumerations.
- **FR-006**: A typed data-access client MUST be generated from the schema and compile
  against the codebase.
- **FR-007**: The project MUST provide environment-configuration management with a
  committed, secret-free example file listing every required variable. This MUST include
  two distinct database connection variables — a pooled runtime URL (`DATABASE_URL`) and a
  separate direct URL (`DIRECT_URL`) used for migrations — plus placeholders for the keys
  later phases need.
- **FR-013**: The data-access layer MUST be configured to use the pooled `DATABASE_URL`
  for application runtime queries and the `DIRECT_URL` for applying migrations.
- **FR-008**: The real environment file containing secrets MUST be excluded from version
  control.
- **FR-009**: The styling toolchain MUST be installed and usable, so utility styling is
  available to all pages.
- **FR-010**: The animation toolchain MUST be installed and importable for use in later
  phases.
- **FR-011**: The application MUST start locally on a clean clone after dependencies are
  installed and the example environment file is copied and populated.
- **FR-012**: The migration history MUST be committed so any teammate can reproduce the
  identical schema state on a fresh database.

### Key Entities *(include if feature involves data)*

- **User**: A person who will use the product. Owns interviews and results. Key
  attributes: identity (email), credentials reference, timestamps. Root of all
  user-scoped data (per constitution Principle XI).
- **Account**: Authentication-provider linkage for a user, as required by the auth
  framework's data model. Related to exactly one User.
- **Session**: A persisted authentication session record as required by the Auth.js
  adapter's data model. Related to one User. Included for adapter compatibility; remains
  empty in practice because credentials auth uses JWT (token) sessions per the
  constitution.
- **VerificationToken**: A token record required by the Auth.js adapter schema. Included
  for adapter compatibility; unused under JWT credentials auth.
- **Interview**: A single mock-interview instance configured and owned by a User. Carries
  configuration (type, field, language, difficulty), a status drawn from the interview
  status enumeration (`CREATED` → `IN_PROGRESS` → `COMPLETED`, with a terminal `FAILED`
  state for dropped calls or scoring errors), the captured transcript, and a reference to
  the external voice-call identifier. Related to one User and to at most one Result.
- **Result**: The scored evaluation produced from a completed interview's transcript.
  Carries an overall score, per-dimension scores, a summary, and improvement points.
  Related to exactly one Interview.
- **Enumerations**: Controlled value sets backing the entities above — the interview
  status enumeration (`CREATED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`), and the
  interview-configuration value sets (type, field, language, difficulty).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The production build completes with zero errors and zero type errors on a
  clean checkout.
- **SC-002**: A push to the deployment-tracked branch results in a successful hosted
  deployment that serves the skeleton at a public URL within the host's standard build
  time, with no manual fix-ups required.
- **SC-003**: Applying the first migration to a brand-new, empty database succeeds on the
  first attempt and creates every defined entity table and enumeration.
- **SC-004**: A new developer can go from a clean clone to a running local app in under 15
  minutes using only the committed README/example environment file, with no undocumented
  steps.
- **SC-005**: No secret value is present anywhere in version control; the only committed
  configuration file is the secret-free example.

## Assumptions

- **Stack is constitutionally fixed**: Next.js (App Router) + TypeScript, Tailwind, GSAP,
  Prisma over Postgres, and Vercel as the host are mandated by the constitution and are
  treated as fixed constraints, not choices to be evaluated in this phase.
- **Postgres availability**: A Postgres instance (managed, e.g. a Vercel-compatible
  provider, or local for development) is available for the first migration; selecting the
  specific provider is a setup detail, not a scope decision for this phase.
- **No product features in scope**: Authentication, the create-interview flow, the live
  interview room, scoring, the dashboard, and the landing page are explicitly out of
  scope for Phase 0 — they are later phases. Phase 0 ships only an empty, deployable shell.
- **Schema detail level**: The exact column types, indexes, and full enum value lists are
  refined during planning/implementation; this spec fixes the set of entities and the
  requirement that the migration applies cleanly, not the final column-level schema.
- **Single deployment environment**: A single production deployment target is assumed for
  this phase; multi-environment (staging/preview) promotion strategy is out of scope.
- **Secret-free example file**: Required environment variables for later phases (voice
  provider keys, LLM key, auth secret) are represented as placeholders in the example
  file now so the shape is documented, even though those services are not yet integrated.
