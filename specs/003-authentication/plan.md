# Implementation Plan: Phase 2 — Authentication

**Branch**: `003-authentication` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-authentication/spec.md`

## Summary

Add email + password accounts to Mockable: a visitor can register (name + email + password),
sign in, sign out, and stay signed in for a 30-day rolling session; pages that require an
account redirect anonymous visitors to sign-in and send them back to where they were headed.
This is the identity layer every later phase depends on.

**Technical approach**: Auth.js (NextAuth **v5**) with the Prisma adapter and a **Credentials**
provider on **JWT sessions** (Principle X — the credentials provider cannot use DB sessions).
Use the v5 **split-config** pattern: an edge-safe `authConfig` (providers list + `authorized`
callback) consumed by `middleware.ts` to gate routes, and a Node-runtime `auth.ts` that adds
the Prisma adapter and the bcrypt-based `authorize()` (bcrypt needs the Node runtime, so the
credential check never runs at the edge). Sign-up is a **server action** that validates input
with a shared Zod schema, normalizes the email, hashes the password with **bcryptjs**, creates
the `User`, then establishes a session. All credential handling is server-side (Principle II).
This is also the first real **product UI**, so it establishes the design-system tokens/fonts
(cream background, Plus Jakarta Sans + Inter, violet→coral gradient) needed to match the
sign-in/sign-up mockups, plus a minimal protected `/dashboard` placeholder as the post-auth
landing target.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node 20 LTS; React 19 / Next.js 15.5 (App
Router) from the Phase 0/1 skeleton.

**Primary Dependencies**:
- `next-auth@beta` (Auth.js **v5**) — **new** this phase (the credentials/session engine).
- `@auth/prisma-adapter` — **already installed** (Phase 0); wires Auth.js to the existing
  `User`/`Account`/`Session` Prisma models.
- `bcryptjs` (+ `@types/bcryptjs`) — **new**; password hashing/verification (Principle X allows
  bcrypt or argon2; bcryptjs is pure-JS and Vercel-friendly with no native build step).
- `zod` — **new**; one schema shared by client and server for sign-up/sign-in validation.
- Existing: Next.js 15, React 19, Tailwind v4, Prisma 6, `@prisma/client`.
- `next/font` (Google) for **Plus Jakarta Sans** (headings) + **Inter** (body).

**Storage**: Postgres via Prisma (existing). Writes the `User` row (`name`, `email`,
`passwordHash`). Sessions are **stateless JWT** — the `Session` table is **not** used for
credential sessions (kept only for future adapter/OAuth compatibility; see schema comment).

**Testing**: Primary gate is type-cleanliness + build — `tsc --noEmit`, `next build`, ESLint —
plus **manual acceptance** of the spec's round-trip scenarios (register → sign out → sign in;
anonymous → protected page → redirect → sign in → land on target). Pure helpers (`password.ts`
hash/verify, the Zod schemas) are unit-test candidates; no new test runner is mandated for this
phase (consistent with the project's current setup), but a lightweight Vitest unit for those two
modules is recommended and low-cost.

**Target Platform**: Modern browser; Next.js full-stack app on local dev and the existing Vercel
deployment. Middleware runs on the **edge** runtime (JWT verify only); credential checks run on
the **Node** runtime.

**Project Type**: Web application — single Next.js full-stack project (same as Phases 0–1).

**Performance Goals**: No animation/Lighthouse budget here (auth pages are clean product UI, not
the showpiece). Sign-up/sign-in complete in well under the SC-001 60-second human budget; the
only latency is a single bcrypt hash + one DB write/read.

**Constraints**: Browser holds **no secrets** (Principle II) — `AUTH_SECRET`, `DATABASE_URL`
stay server-side; all hashing/verification/creation is server-side (FR-013). Strict TS, no
unjustified `any` (Principle IV). UI is English/LTR (Principle VI). Passwords bcrypt-hashed,
never logged in plaintext (Principle X). No account enumeration (FR-006).

**Scale/Scope**: Small — two auth screens, one auth backend (provider + adapter + middleware +
helpers), one placeholder dashboard, design-token bootstrap. Single-tenant per user; no scale
concerns at this phase.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Relevance to this phase | Status |
|-----------|------------------------|--------|
| I. Fixed Stack | Uses the mandated Auth.js (NextAuth v5) + Prisma + credentials provider exactly as specified; bcryptjs and zod are standard support libs, not stack substitutions | ✅ PASS |
| II. No Secrets in Browser | `AUTH_SECRET` + DB URL stay server-side; all credential logic runs in server action / Node-runtime `authorize()`. Browser only ever sees the session cookie (httpOnly) | ✅ PASS |
| III. Live vs. Evaluation | No live-voice or scoring surface in this phase; separation untouched | ✅ N/A |
| IV. Type Safety | `strict` stays on; Zod-inferred types for form input; Auth.js `session`/`jwt` callbacks typed via module augmentation; no unjustified `any` | ✅ PASS |
| V. Idiomatic React/TS | Auth pages are Server Components; only the interactive form bodies are Client Components. Functional + hooks throughout | ✅ PASS |
| VI. English app, AR voice only | All auth UI is English/LTR; no i18n/RTL introduced | ✅ PASS |
| VII. Design Identity | First product UI: establishes light-mode design tokens (cream, violet→coral, Plus Jakarta Sans/Inter) and matches the sign-in/sign-up mockups; clean and focused, no heavy animation needed | ✅ PASS |
| VIII. Accessibility Floor | Forms are keyboard-navigable with visible focus, labeled inputs, error text associated to fields, sufficient contrast on the cream palette | ✅ PASS |
| IX. Performance Floor | No landing-page budget here; no heavy assets/animation | ✅ N/A |
| X. Security | Passwords bcrypt-hashed, never stored/logged plaintext; **JWT sessions** (credentials provider requirement); all input validated/sanitized server-side; no account enumeration | ✅ PASS (directly exercised) |
| XI. User-Owned Data | Establishes the authenticated user id that every later per-user query scopes by; the `requireAuth()` helper is the basis for that scoping | ✅ PASS (foundation) |

**Result**: No violations. Client Components are limited to the interactive form bodies
(Principle V); design-token bootstrap is required to honor Principle VII for the first real
pages. Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-authentication/
├── plan.md              # This file
├── research.md          # Phase 0 — Auth.js v5 split-config, hashing, session, design-token decisions
├── data-model.md        # Phase 1 — User write shape, validation rules, session/JWT shape
├── quickstart.md        # Phase 1 — env setup → run → exercise the auth round trip
├── contracts/
│   ├── auth-routes.md    # Route/page + server-action contract (sign-up/in/out, protected redirect)
│   └── session-contract.md  # JWT/session shape + middleware authorization contract
└── checklists/
    └── requirements.md  # Spec quality checklist (from /speckit-specify)
```

### Source Code (repository root)

```text
mockable/
├── middleware.ts                       # Edge: gate matched routes via authConfig.authorized (FR-010, FR-011)
├── app/
│   ├── layout.tsx                      # + Plus Jakarta Sans/Inter fonts, SessionProvider
│   ├── globals.css                     # Design-system tokens (cream, violet, coral, lime, radii)
│   ├── (auth)/
│   │   ├── layout.tsx                  # Centered glass card layout for auth screens
│   │   ├── sign-up/page.tsx            # Server Component; renders <SignUpForm/> (US1)
│   │   └── sign-in/page.tsx            # Server Component; renders <SignInForm/> (US2)
│   ├── dashboard/
│   │   └── page.tsx                    # Protected placeholder; post-auth landing (FR-015, US3/US4 target)
│   └── api/
│       └── auth/[...nextauth]/route.ts # Auth.js GET/POST handlers (re-exported from lib/auth)
├── components/
│   └── auth/
│       ├── sign-up-form.tsx            # 'use client'; calls signUpAction, shows field errors (US1)
│       ├── sign-in-form.tsx            # 'use client'; calls signIn('credentials'); generic error (US2)
│       └── sign-out-button.tsx         # 'use client'; calls signOut() (US4)
├── lib/
│   └── auth/
│       ├── config.ts                   # Edge-safe authConfig: providers shell + callbacks (authorized, jwt, session, pages)
│       ├── index.ts                    # NextAuth(authConfig + PrismaAdapter + Credentials.authorize); exports { auth, handlers, signIn, signOut }
│       ├── password.ts                 # hashPassword / verifyPassword (bcryptjs)
│       ├── actions.ts                  # 'use server' signUpAction (validate → normalize → hash → create → signIn)
│       └── guards.ts                   # requireAuth() server helper → session or redirect('/sign-in')
├── lib/validation/
│   └── auth.ts                         # Zod signUpSchema / signInSchema (shared client + server)
├── types/
│   └── next-auth.d.ts                  # Module augmentation: session.user.id, jwt fields
├── .env.example                        # (unchanged — AUTH_SECRET already present)
└── package.json                        # + next-auth, bcryptjs, @types/bcryptjs, zod
```

**Structure Decision**: Reuses the Phase 0/1 single Next.js project. Auth backend lives under
`lib/auth/` (split config so middleware stays edge-safe while bcrypt runs in Node), validation is
shared in `lib/validation/`, and auth screens sit in an `(auth)` route group so they share a
centered-card layout without affecting URL paths. The protected `/dashboard` is a real route
(minimal placeholder) so the protection mechanism (FR-010) and post-auth landing (FR-015) are
demonstrated against an actual gated page that Phase 6 later fills in.

## Complexity Tracking

> No constitution violations — section intentionally empty.
