# Phase 1 — Data Model: Authentication

This phase introduces **no new Prisma models or migrations**. The `User`, `Account`, `Session`,
and `VerificationToken` models already exist (Phase 0) and are adapter-compatible. Phase 2 simply
starts **populating** `User.passwordHash` and `User.name`, and uses **stateless JWT** sessions
(so the `Session` table stays unused for credential logins).

## Entities

### User (existing model — fields used this phase)

| Field | Type | Used how in Phase 2 |
|-------|------|---------------------|
| `id` | String (cuid) | Primary key; becomes `session.user.id` (basis for Principle XI scoping in later phases) |
| `name` | String? | **Now required at sign-up** (FR-001); the display name. Stored non-empty/trimmed. |
| `email` | String `@unique` | Stored **trimmed + lowercased**; uniqueness enforced by the existing `@unique` index (FR-003) |
| `emailVerified` | DateTime? | Left `null` — no email verification this phase (spec Assumption) |
| `passwordHash` | String? | **Populated this phase**: bcryptjs hash, cost 12. Never null for credentials users; never holds plaintext (FR-004, Principle X) |
| `image` | String? | Unused this phase (no avatar upload) |
| `createdAt` / `updatedAt` | DateTime | Managed by Prisma defaults |

> No schema change required. `name` and `passwordHash` are already nullable columns; the
> **application** enforces that both are set when an account is created via the credentials sign-up
> path. (A future migration could tighten `passwordHash`/`name` to non-null once OAuth is ruled in
> or out — out of scope here.)

### Session (conceptual — JWT, not a DB row)

The authenticated session is a **signed JWT cookie** (httpOnly), not a `Session` table row.

| Aspect | Value |
|--------|-------|
| Strategy | `jwt` (forced by the Credentials provider; Principle X) |
| Lifetime | 30 days, **rolling** — refreshed on use (clarification) |
| Token claims (after callbacks) | `sub`/`id` (user id), `name`, `email`, `exp` |
| Exposed to app via `auth()` | `session.user = { id, name, email }` |
| Invalidation | Sign-out clears the cookie; expired/tampered tokens fail verification → treated as unauthenticated (FR-012) |

### Credentials (transient — never persisted)

The submitted `{ email, password }` (+ `name` on sign-up). Validated, then the password becomes a
bcrypt hash and the plaintext is discarded — never stored, never logged (FR-004, FR-013).

## Validation rules (Zod — `lib/validation/auth.ts`)

### `signUpSchema`
| Field | Rule | Source |
|-------|------|--------|
| `name` | required, trimmed, length ≥ 1 (non-empty) | FR-002 (clarification: name required) |
| `email` | required, valid email format, trimmed + lowercased (transform) | FR-002, FR-003 |
| `password` | required, **min 8 characters**, no character-type requirement | FR-002 (clarification) |

### `signInSchema`
| Field | Rule |
|-------|------|
| `email` | required, valid email format, trimmed + lowercased |
| `password` | required, non-empty |

Both schemas validate on the client (instant feedback) and are **re-validated server-side** as the
authoritative gate (FR-014). Invalid input yields field-level messages and never an unhandled
server error.

## Lifecycle / state transitions

```text
            signUpAction (validate → hash → create User)
visitor ───────────────────────────────────────────────▶ authenticated (JWT issued)
                                                              │
   ┌──────────────────────────────────────────────────────────┤
   │ signIn('credentials')  (authorize: lookup + bcrypt verify)│
anonymous ◀───────────────────────────────────────────────────┘
   ▲   │
   │   │ request protected page
   │   ▼
   │  middleware.authorized? ── no ──▶ redirect /sign-in?callbackUrl=<original>  (FR-010/011)
   │                          └─ yes ─▶ page served
   │
   └── signOut() clears cookie ◀── authenticated
       expired/tampered JWT (30d rolling) ──▶ treated as anonymous (FR-012)
```

**Account states**: a `User` row, once created, is simply "exists". There is no email-verification
pending state this phase, no lock/disable state (rate-limiting/lockout is deferred to Phase 8).

## Relationships (unchanged)

`User 1───* Interview`, `User 1───* Account`, `User 1───* Session` already defined. Phase 2 only
reads/writes `User`; later phases attach `Interview`/`Result` scoped by `session.user.id`
(Principle XI).
