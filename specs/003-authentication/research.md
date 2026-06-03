# Phase 0 — Research: Authentication

All Technical Context unknowns are resolved below. Each decision lists rationale and the
alternatives considered.

## 1. Auth library & version

- **Decision**: Auth.js **NextAuth v5** (`next-auth@beta`) with `@auth/prisma-adapter`, using a
  **Credentials** provider and **JWT** session strategy.
- **Rationale**: Mandated by the constitution (Principle I fixes the stack to "Auth.js (NextAuth
  v5) with the credentials provider"; Principle X requires JWT sessions because the credentials
  provider cannot use database sessions). The Prisma adapter is already installed and the
  `User`/`Account`/`Session` models already exist from Phase 0.
- **Alternatives considered**: Lucia / hand-rolled sessions / Clerk — all rejected: they would
  violate the fixed-stack principle and require a constitution amendment.

## 2. Edge-safe split config (the v5 pattern)

- **Decision**: Two files. `lib/auth/config.ts` exports an edge-safe `authConfig` containing the
  `pages`, the `authorized` callback, and the `jwt`/`session` callbacks (no adapter, no bcrypt).
  `lib/auth/index.ts` calls `NextAuth({ ...authConfig, adapter: PrismaAdapter(prisma), providers:
  [Credentials({ authorize })] })` and exports `{ auth, handlers, signIn, signOut }`.
  `middleware.ts` imports **only** `authConfig` (via `NextAuth(authConfig).auth`).
- **Rationale**: `middleware.ts` runs on the **edge** runtime, which cannot run bcrypt or the
  Prisma client. Splitting keeps middleware able to verify the JWT and enforce route protection
  while the actual credential check (`authorize`, which needs bcrypt + Prisma) is confined to the
  **Node** runtime in the route handler / server action. This is the documented Auth.js v5
  approach for credentials + middleware.
- **Alternatives considered**: A single config imported everywhere → fails: pulling the Prisma
  adapter/bcrypt into the edge bundle breaks the middleware build. Doing route protection in each
  page instead of middleware → more error-prone and easy to forget; middleware centralizes
  FR-010.

## 3. Password hashing

- **Decision**: `bcryptjs` with a cost factor of **12**; `hashPassword`/`verifyPassword` wrappers
  in `lib/auth/password.ts`.
- **Rationale**: Principle X allows bcrypt **or** argon2. `bcryptjs` is pure JavaScript — no
  native compilation, so it builds cleanly on Vercel and in CI with zero platform fuss. Cost 12 is
  a standard interactive-login tradeoff (~tens of ms). The hash is stored in `User.passwordHash`.
- **Alternatives considered**: `bcrypt` (native) — faster but needs node-gyp/native builds that can
  break on serverless; `argon2` — excellent but also native and heavier to deploy. For this app's
  scale bcryptjs is the lowest-friction compliant choice.
- **Note**: bcrypt truncates input beyond 72 bytes. Acceptable for an 8-char-minimum password
  policy; documented so no one is surprised later.

## 4. Session lifetime & rolling refresh

- **Decision**: `session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }` (30 days). Auth.js
  re-issues the JWT on use, which extends `expires` — giving the **rolling** behavior the spec
  requires (clarification: 30-day sliding window).
- **Rationale**: Matches the clarified decision directly. JWT strategy is forced by the credentials
  provider; the 30-day maxAge with Auth.js's on-use refresh yields a sliding session so active
  users are never abruptly signed out, while abandoned sessions expire.
- **Alternatives considered**: Short 24h sessions (rejected — hurts the returning-user habit loop);
  absolute (non-rolling) expiry (rejected per clarification).

## 5. Identity normalization & uniqueness (edge cases)

- **Decision**: Normalize email to **trimmed + lowercased** before both lookup and storage. Rely on
  the existing `@unique` constraint on `User.email` as the source of truth; on create, catch the
  Prisma unique-violation (`P2002`) and surface it as "email already in use" (FR-003).
- **Rationale**: Covers the spec's email-casing/whitespace edge case ( `User@Example.com ` ≡
  `user@example.com`) and the duplicate-registration race: even if two requests pass the
  pre-check, the DB constraint guarantees only one account is created; the loser is caught and
  shown the same clean error.
- **Alternatives considered**: App-only uniqueness check without the DB constraint (rejected — racy);
  storing email verbatim and comparing case-insensitively in queries (rejected — fragile, and the
  unique index would not catch casing dupes).

## 6. No account enumeration (FR-006)

- **Decision**: The Credentials `authorize()` returns `null` identically for "no such email" and
  "wrong password"; the sign-in form maps any `CredentialsSignin` error to one generic message
  ("Invalid email or password"). Timing is acceptably uniform because a missing user still performs
  a comparable amount of work (a constant-time-ish path); a dummy hash compare can be added if a
  timing concern is raised.
- **Rationale**: Directly satisfies FR-006 / SC-005 — unknown email and wrong password are
  indistinguishable to the caller.
- **Alternatives considered**: Distinct error messages (rejected — leaks which emails are
  registered).

## 7. Route protection & return-to-original (FR-010, FR-011)

- **Decision**: `middleware.ts` matches protected paths (e.g. `/dashboard`, and later
  `/interview/:path*`) and uses the `authorized` callback. When unauthenticated, Auth.js redirects
  to the sign-in page with a `callbackUrl`. On successful sign-in, `signIn` redirects to that
  `callbackUrl` (defaulting to `/dashboard`). Already-authenticated visitors hitting `/sign-in` or
  `/sign-up` are bounced to `/dashboard` (handled in the `authorized` callback / page-level
  `auth()` check).
- **Rationale**: Centralizes the gate (one matcher), satisfies the redirect-then-return journey
  (US3 scenario 2), and the post-auth default landing (FR-015).
- **Alternatives considered**: Per-page guards only (rejected — easy to miss a page); a custom
  cookie scheme (rejected — Auth.js already provides `callbackUrl`).

## 8. Sign-up flow shape

- **Decision**: A **server action** `signUpAction` (in `lib/auth/actions.ts`): validate with
  `signUpSchema` → normalize email → `bcrypt` hash → `prisma.user.create` → call `signIn(
  "credentials", ...)` to establish the session → redirect to `/dashboard`. Field-level errors are
  returned to the client form for display.
- **Rationale**: Server actions keep all secrets/hashing server-side (FR-013, Principle II), give a
  progressive-enhancement-friendly form, and let sign-up immediately produce a signed-in session
  (US1 acceptance: "recognized as signed in").
- **Alternatives considered**: A separate `/api/register` route handler (works, but a server action
  is more idiomatic in App Router and co-locates validation); creating the user inside `authorize()`
  (rejected — conflates registration with sign-in and muddies enumeration handling).

## 9. Validation library

- **Decision**: `zod`. `lib/validation/auth.ts` exports `signUpSchema` (name non-empty; email
  format; password ≥ 8 chars) and `signInSchema`. The same schemas validate on the client (instant
  feedback) and are **re-validated** on the server (authoritative).
- **Rationale**: One source of truth for input rules (matches the clarified password rule: ≥8
  chars, no character-type requirements), strong TS inference for form types (Principle IV), and
  server-side validation is the real gate (FR-014).
- **Alternatives considered**: Hand-written validators (rejected — duplicative, weaker types);
  other schema libs (zod is the de-facto standard and adds no stack conflict).

## 10. Design-system bootstrap (first product UI)

- **Decision**: This phase establishes the core design tokens in `globals.css` (cream `#FCF9F5`
  base, Electric Violet primary, Coral Pink secondary, Lime accent, 24px/pill radii) and loads
  **Plus Jakarta Sans** (headings) + **Inter** (body) via `next/font`, replacing the default Geist
  setup. The auth screens follow `design/screens/sign_up_mockable.png` and
  `sign_in_mockable.png` (centered glass card, gradient primary button).
- **Rationale**: CLAUDE.md makes `/design` the source of truth and current `globals.css` still has
  the create-next-app defaults; the auth pages are the first real product surface, so the tokens
  must land here to honor Principle VII. Scope is kept to what the auth pages + placeholder
  dashboard need — not a full component library.
- **Reconciliation note (mockup vs. spec)**: The sign-up mockup shows only Email + Password, but the
  clarified spec requires a **required name field** (FR-001). Resolution: add a "Full name" input as
  the first field, styled identically to the mockup's inputs — a faithful extension, not a restyle.
  The sign-in mockup's "Forgot password?" link is **omitted** for this phase (password reset is
  explicitly deferred in the spec's Assumptions); it returns when reset is built.

## 11. Testing approach

- **Decision**: Quality gate = `tsc --noEmit` + `next build` + ESLint, plus **manual acceptance**
  of the spec scenarios (the register→sign-out→sign-in round trip and the protected-route redirect
  journey). Recommend (not mandate) a lightweight **Vitest** unit covering `password.ts`
  (hash≠plaintext, verify true/false) and the Zod schemas (accept/reject cases).
- **Rationale**: Consistent with the project's current setup (no runner yet) and the constitution's
  Quality Gates (type-clean, loading + error states, `/speckit-analyze` before implement). The two
  pure modules are the highest-value, lowest-cost unit targets if a runner is added.
- **Alternatives considered**: Full E2E (Playwright) for the auth journey — valuable but heavier
  than this phase warrants; can be added in Phase 8 hardening.

## Resolved unknowns summary

| Unknown (Technical Context) | Resolution |
|-----------------------------|------------|
| Auth engine & session strategy | Auth.js v5, Credentials, JWT 30-day rolling |
| Edge vs Node runtime split | Split config; middleware edge-safe, authorize in Node |
| Hashing algorithm | bcryptjs, cost 12 |
| Email uniqueness/casing & race | Normalize + DB unique constraint + P2002 catch |
| Enumeration prevention | Identical null return + single generic error |
| Protected-route mechanism | middleware + authorized callback + callbackUrl |
| Validation | zod schemas shared client/server |
| Design tokens/fonts | Bootstrap cream/violet/coral + Jakarta/Inter now |
| Testing | type/build gate + manual acceptance; optional Vitest units |
