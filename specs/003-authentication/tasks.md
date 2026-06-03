---

description: "Task list for Phase 2 — Authentication"
---

# Tasks: Phase 2 — Authentication

**Input**: Design documents from `/specs/003-authentication/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested as TDD. The spec's acceptance is manual + the type/build gate. A small
**optional** Vitest unit (password + validation) is included in Polish per research §11.

**Organization**: Tasks are grouped by user story. Authentication is shared-infrastructure-heavy,
so the session engine lives in Foundational; each story owns its user-facing surface
(form/page/button) and is independently testable once Foundational is done.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US4 (Setup/Foundational/Polish carry no story label)

## Path Conventions

Single Next.js full-stack project at repo root: `app/`, `components/`, `lib/`, `types/`,
`middleware.ts` (per plan.md Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, design-system bootstrap (first product UI), and local auth env.

- [X] T001 Install auth dependencies: `npm install next-auth@beta bcryptjs zod` and `npm install -D @types/bcryptjs` (updates `package.json` / `package-lock.json`)
- [X] T002 [P] Add design-system tokens to `app/globals.css` — cream base `#FCF9F5`, Electric Violet primary, Coral Pink secondary, Lime accent, 24px/pill radii, violet→coral gradient (per `design/README.md`)
- [X] T003 [P] Replace Geist fonts with Plus Jakarta Sans (headings) + Inter (body) via `next/font` and wrap children in Auth.js `<SessionProvider>` in `app/layout.tsx`
- [X] T004 [P] Generate `AUTH_SECRET` (`openssl rand -base64 32`) into local `.env` (`.env.example` already lists it — no change there; no new env vars)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The Auth.js v5 session engine + shared helpers that EVERY story depends on.

**⚠️ CRITICAL**: No user story can be completed until this phase is done.

- [X] T005 [P] Implement `hashPassword` / `verifyPassword` (bcryptjs, cost 12) in `lib/auth/password.ts` (FR-004, Principle X)
- [X] T006 [P] Implement `signUpSchema` + `signInSchema` (name non-empty; email format + trim/lowercase transform; password min 8, no char-type rule) in `lib/validation/auth.ts` (FR-002, data-model.md)
- [X] T007 [P] Add NextAuth module augmentation for `session.user.id` + JWT `id` in `types/next-auth.d.ts` (Principle IV)
- [X] T008 Create edge-safe `authConfig` in `lib/auth/config.ts` — `pages.signIn = "/sign-in"`, `session { strategy: "jwt", maxAge: 30d }`, and `jwt` / `session` / `authorized` callbacks (authorized gates protected paths + bounces authed users off `/sign-in` & `/sign-up`). NO adapter/bcrypt here (depends on T007)
- [X] T009 Create full auth init in `lib/auth/index.ts` — `NextAuth({ ...authConfig, adapter: PrismaAdapter(prisma), providers: [Credentials({ authorize })] })`; `authorize` normalizes email, looks up user, `verifyPassword`, returns user or `null` identically for unknown-email/wrong-password (FR-006); exports `{ auth, handlers, signIn, signOut }` (depends on T005, T006, T008)
- [X] T010 Add Auth.js route handler re-exporting `{ GET, POST } = handlers` in `app/api/auth/[...nextauth]/route.ts` (depends on T009)
- [X] T011 Create `middleware.ts` exporting `NextAuth(authConfig).auth` with `matcher: ["/dashboard/:path*"]` (edge runtime; JWT verify only — FR-010/011/012) (depends on T008)
- [X] T012 [P] Implement `requireAuth()` server guard (returns session or `redirect('/sign-in')`) in `lib/auth/guards.ts` (FR-009, FR-010) (depends on T009)
- [X] T013 Create centered glass-card auth layout in `app/(auth)/layout.tsx` matching `design/screens/sign_in_mockable.png` (depends on T002, T003)

**Checkpoint**: Session engine works; route protection active; user-story surfaces can now be built (in parallel if staffed).

---

## Phase 3: User Story 1 - Register a new account (Priority: P1) 🎯 MVP

**Goal**: A visitor registers with name + email + password and ends up signed in.

**Independent Test**: Submit `/sign-up` with a fresh email + 8+ char password → account created and you reach a protected page without redirect; duplicate email and weak/blank input are rejected with field errors and no account.

### Implementation for User Story 1

- [X] T014 [US1] Implement `signUpAction` (`'use server'`) in `lib/auth/actions.ts`: re-validate with `signUpSchema` → normalize email → `hashPassword` → `prisma.user.create` → catch Prisma `P2002` as "email already exists" (FR-003) → `signIn('credentials', …)` → redirect to `callbackUrl`/`/dashboard`; return field errors on failure (FR-014) (depends on T005, T006, T009)
- [X] T015 [P] [US1] Build `<SignUpForm/>` (`'use client'`) in `components/auth/sign-up-form.tsx` — name/email/password fields styled per sign-up mockup (name field added per FR-001), client-side `signUpSchema` feedback, field-error + pending/disabled submit states (depends on T006, T014)
- [X] T016 [US1] Create `app/(auth)/sign-up/page.tsx` (Server Component) rendering `<SignUpForm/>`; if already authenticated, `redirect('/dashboard')` (depends on T013, T015)

**Checkpoint**: Registration works end to end and yields a signed-in session.

---

## Phase 4: User Story 2 - Sign in to an existing account (Priority: P1)

**Goal**: A returning user signs in; wrong credentials are rejected with a single generic message.

**Independent Test**: With an existing account, `/sign-in` with correct credentials → signed in; wrong password and unknown email both show the **same** "Invalid email or password." (no enumeration).

### Implementation for User Story 2

- [X] T017 [P] [US2] Build `<SignInForm/>` (`'use client'`) in `components/auth/sign-in-form.tsx` — email/password per sign-in mockup (omit "Forgot password?" — reset deferred), calls `signIn('credentials', { redirectTo })`, maps any `CredentialsSignin` to one generic error (FR-006, SC-005), pending state (depends on T009, T006)
- [X] T018 [US2] Create `app/(auth)/sign-in/page.tsx` (Server Component) rendering `<SignInForm/>`, reading `callbackUrl` searchParam for redirect-after-login; if already authenticated, `redirect('/dashboard')` (depends on T013, T017)

**Checkpoint**: Returning users sign in; the register→(US1)→sign-in loop is closed.

---

## Phase 5: User Story 3 - Gated pages turn away unauthenticated visitors (Priority: P1)

**Goal**: Anonymous requests to a protected page redirect to sign-in, then return to the original destination after login.

**Independent Test**: Signed out, visit `/dashboard` directly → redirected to `/sign-in?callbackUrl=/dashboard`; sign in → land back on `/dashboard`; signed-in visit to `/dashboard` renders without redirect.

### Implementation for User Story 3

- [X] T019 [US3] Create protected `app/dashboard/page.tsx` (Server Component) calling `requireAuth()`, rendering a minimal authenticated placeholder (greets `session.user.name`) — the post-auth landing target (FR-015), to be expanded in Phase 6 (depends on T012)
- [X] T020 [US3] Verify/extend the protection journey: confirm `middleware.ts` matcher covers `/dashboard`, the `authorized` callback redirects anonymous → `/sign-in` with `callbackUrl`, and successful sign-in returns to the original path (FR-010, FR-011) — adjust `lib/auth/config.ts` callback / `middleware.ts` matcher as needed (depends on T011, T018, T019)

**Checkpoint**: Protection + return-to-original works against a real gated page.

---

## Phase 6: User Story 4 - Sign out and persistent sessions (Priority: P2)

**Goal**: A signed-in user can sign out; sessions persist across navigation/reload (30-day rolling).

**Independent Test**: While signed in, navigate + reload → still signed in; click Sign out → anonymous; then `/dashboard` redirects to sign-in.

### Implementation for User Story 4

- [X] T021 [P] [US4] Build `<SignOutButton/>` (`'use client'`) calling `signOut({ redirectTo: '/sign-in' })` in `components/auth/sign-out-button.tsx` (depends on T009, T003)
- [X] T022 [US4] Add `<SignOutButton/>` to `app/dashboard/page.tsx`; confirm the 30-day rolling JWT (T008 `maxAge` + on-use refresh) keeps the user signed in across reloads (FR-007, FR-008) (depends on T019, T021)

**Checkpoint**: Full round trip — register → sign out → sign back in — and session persistence both verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gate, accessibility, security spot-check, optional units.

- [X] T023 [P] Accessibility pass (Principle VIII): labeled inputs, error text associated to fields, visible keyboard focus, contrast against cream — across `components/auth/*` and `app/dashboard/page.tsx`
- [X] T024 [P] Loading/error/empty-state review (Quality Gate): pending submit states, sign-in generic error region, sign-up field errors render correctly
- [ ] T025 [P] (Optional) Add Vitest unit tests for `lib/auth/password.ts` (hash ≠ plaintext, verify true/false) and `lib/validation/auth.ts` (accept/reject cases) per research §11
- [X] T026 Security spot-check (quickstart §"Security checklist"): DB `passwordHash` is bcrypt not plaintext, session cookie httpOnly, no `AUTH_SECRET`/DB URL in client bundle (Principles II & X)
- [X] T027 Run quality gate: `npx tsc --noEmit`, `npm run lint`, `npm run build` must all pass (Principle IV + Quality Gates)
- [ ] T028 Run `quickstart.md` manual acceptance scenarios (US1–US4 round trips)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**.
- **User Stories (Phases 3–6)**: All depend on Foundational. US1 & US2 are independent of each other. US3 reuses US2's sign-in for the return-journey scenario. US4 reuses US3's dashboard page as the sign-out button's home.
- **Polish (Phase 7)**: Depends on the user stories being complete.

### Story-level dependencies (honest, given shared auth infra)

- **US1 (P1)**: Foundational only. Fully independent.
- **US2 (P1)**: Foundational only. Fully independent.
- **US3 (P1)**: Foundational + (for the full redirect→sign-in→return scenario) US2's sign-in page. The redirect-away half is independently testable without US2.
- **US4 (P2)**: Foundational + US3 (adds the sign-out button to the dashboard); getting signed in to test uses US1 or US2.

### Within each story

- Action/engine wiring before the form; form before the page that renders it.

### Parallel opportunities

- Setup: T002, T003, T004 in parallel (T001 first — installs deps the others assume).
- Foundational: T005, T006, T007 in parallel; then T008 → T009 → (T010, T011, T012) where T010/T011/T012 can parallelize after T009/T008; T013 parallel with the lib work (different files).
- Across stories: once Foundational is done, US1 and US2 can be built in parallel by different people. Within a story, the `[P]` form components are independent of other stories' files.

---

## Parallel Example: Foundational helpers

```bash
# After T001, launch the three pure-helper tasks together:
Task: "Implement hashPassword/verifyPassword in lib/auth/password.ts"   # T005
Task: "Implement signUpSchema/signInSchema in lib/validation/auth.ts"   # T006
Task: "Add next-auth module augmentation in types/next-auth.d.ts"       # T007
```

## Parallel Example: User Stories after Foundational

```bash
# Different developers, different files:
Developer A → US1: T014 → T015 → T016   (sign-up)
Developer B → US2: T017 → T018          (sign-in)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup → 2. Phase 2 Foundational (CRITICAL) → 3. Phase 3 US1 → **STOP & VALIDATE**: a new user can register and reach a protected page. Demo-able.

### Incremental Delivery

1. Setup + Foundational → engine ready.
2. + US1 (register) → MVP.
3. + US2 (sign in) → closes the credential loop.
4. + US3 (protected redirect) → gating enforced with return-to-origin.
5. + US4 (sign out + persistence) → full "Done when" bar met.
6. Polish → accessibility, security spot-check, quality gate, quickstart acceptance.

---

## Notes

- [P] = different files, no incomplete dependency. [Story] = traceability to spec user stories.
- Auth is infra-heavy by nature — Foundational is the largest phase; stories are intentionally thin surfaces over a shared engine.
- Commit after each task or logical group; stop at any checkpoint to validate a story independently.
- Constitution hot spots: Principle II (no secrets client-side), Principle X (bcrypt + JWT + server-side validation), Principle IV (strict types, no unjustified `any`).
