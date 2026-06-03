# Contract — Auth Routes, Pages & Server Action

The UI/interaction contract this feature exposes. Paths, inputs, outputs, and error behavior.

## Pages

| Path | Type | Auth state | Behavior |
|------|------|-----------|----------|
| `/sign-up` | Server Component → `<SignUpForm/>` | anonymous | Renders the registration form (name, email, password). If **already** authenticated → redirect `/dashboard`. |
| `/sign-in` | Server Component → `<SignInForm/>` | anonymous | Renders the sign-in form (email, password). If **already** authenticated → redirect `/dashboard`. |
| `/dashboard` | Server Component (protected) | authenticated | Post-auth landing (FR-015). Anonymous request → redirect `/sign-in?callbackUrl=/dashboard`. Minimal placeholder content + sign-out button until Phase 6. |

## Server action — `signUpAction(formData)` (`lib/auth/actions.ts`, `'use server'`)

**Input** (from the form): `{ name, email, password }`.

**Success**: creates the `User`, establishes a session, and redirects to `callbackUrl` (default
`/dashboard`). Caller ends up authenticated (US1).

**Validation / error outputs** (returned to the client form, not thrown):

| Condition | Result |
|-----------|--------|
| Name empty / email malformed / password < 8 chars | `{ errors: { field: message } }` — field-level messages (FR-014); no account created |
| Email already in use (pre-check **or** Prisma `P2002` race) | `{ errors: { email: "An account with this email already exists." } }`; no duplicate created (FR-003) |
| Valid + unique | session issued; redirect to landing (no error returned) |

**Guarantees**: password is bcrypt-hashed before any DB write; plaintext is never persisted or
logged (FR-004); email is trimmed + lowercased before lookup/create (FR-003).

## Sign-in — `signIn('credentials', { email, password })`

Invoked from `<SignInForm/>` (client). Backed by the Credentials `authorize()` in `lib/auth`.

| Condition | Result |
|-----------|--------|
| Correct email + password | session issued; redirect to `callbackUrl` (default `/dashboard`) (US2) |
| Wrong password **or** unknown email | `authorize` returns `null` → `CredentialsSignin` → form shows the **single generic** message "Invalid email or password." (FR-006, SC-005) |
| Malformed input | blocked by client + server Zod validation before the credential check |

## Sign-out — `signOut()` (`<SignOutButton/>`)

Clears the session cookie and returns the user to an anonymous state (US4); subsequent protected
requests redirect to sign-in (US4 scenario 3).

## Auth.js handler route

`app/api/auth/[...nextauth]/route.ts` re-exports `{ GET, POST } = handlers` from `lib/auth`. Auth.js
owns the internal `/api/auth/*` endpoints (csrf, callback, session, signout). Not called directly by
app code — used by `signIn`/`signOut`/`auth`.

## Error & empty states (Constitution Quality Gate)

- Forms show inline field errors and a top-level form error region (sign-in generic error).
- Submit buttons show a pending/disabled state while the action is in flight.
- A protected page never flashes content to an anonymous user — redirect happens in middleware
  before render.
