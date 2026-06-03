# Contract — Session, JWT & Middleware Authorization

The internal contract between Auth.js callbacks, the session shape app code reads, and the
middleware gate.

## Session configuration

```ts
session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }  // 30 days, rolling (refreshed on use)
pages:   { signIn: "/sign-in" }                          // unauthenticated redirects land here
```

## Callbacks (in edge-safe `authConfig`)

| Callback | Contract |
|----------|----------|
| `jwt({ token, user })` | On sign-in, copy `user.id` → `token.id` (and keep `name`, `email`). Returned token is re-signed on use, giving the rolling 30-day window. |
| `session({ session, token })` | Expose `token.id` as `session.user.id`; ensure `name`, `email` present. |
| `authorized({ auth, request })` | Returns `true`/`false`/`Response` to gate matched routes. `false` → Auth.js redirects to `pages.signIn` with `callbackUrl`. Used by `middleware.ts` (FR-010). Also bounces authenticated users away from `/sign-in` & `/sign-up`. |

## Session shape consumed by app code

```ts
const session = await auth();   // server: layouts, pages, server actions, route handlers
// session === null  → anonymous
// session.user === { id: string; name: string; email: string }
```

`requireAuth()` (`lib/auth/guards.ts`) wraps this: returns the non-null session for an authenticated
caller, or `redirect('/sign-in')` otherwise. This is the reusable server-side guard (FR-009, FR-010)
and the seed of Principle XI per-user scoping in later phases.

## Middleware contract (`middleware.ts`, edge runtime)

```ts
export { auth as middleware } from "<NextAuth(authConfig).auth>";
export const config = {
  matcher: ["/dashboard/:path*"],   // extended in later phases (e.g. /interview/:path*)
};
```

- Runs on the **edge** runtime — verifies the JWT only; **no** Prisma/bcrypt imported here (that is
  why the config is split — see research §2).
- Unauthenticated request to a matched path → 302 to `/sign-in?callbackUrl=<original>` (FR-010,
  FR-011).
- Authenticated request → passes through.
- Invalid/expired/tampered token → fails verification → treated as unauthenticated (FR-012).

## Type augmentation (`types/next-auth.d.ts`)

Augment `Session["user"]` and the JWT to include `id: string` so `session.user.id` is strongly
typed (Principle IV — no `any`).

## Security invariants

- The session cookie is httpOnly — not readable by client JS (Principle II).
- `AUTH_SECRET` (server-only env) signs/verifies the JWT; absent secret → app fails fast.
- No secret, password, or hash ever crosses to the browser or appears in logs.
