# Quickstart — Phase 2 Authentication

How to set up, run, and exercise the auth round trip locally.

## 1. Install new dependencies

```bash
npm install next-auth@beta bcryptjs zod
npm install -D @types/bcryptjs
```

(`@auth/prisma-adapter` is already installed from Phase 0.)

## 2. Environment

`AUTH_SECRET` is already in `.env.example`. Generate one and put it in `.env`:

```bash
# generates a value for AUTH_SECRET
openssl rand -base64 32
```

Ensure `DATABASE_URL` / `DIRECT_URL` point at your Postgres (from Phase 0). No new env vars are
introduced this phase.

> No new migration is needed — `User.name` and `User.passwordHash` already exist. If your local DB
> predates Phase 0's schema, run `npx prisma migrate dev` first.

## 3. Run

```bash
npm run dev
```

## 4. Exercise the acceptance scenarios

**Register (US1)**
1. Visit `/sign-up`. Enter a name, a fresh email, and an 8+ char password → submit.
2. Expect: account created, you are signed in, and you land on `/dashboard`.
3. Try again with the **same email** → expect a clear "already exists" error, no duplicate.
4. Try a 5-char password / blank name / malformed email → expect inline field errors, no account.

**Sign in / sign out round trip (US2, US4)**
1. From `/dashboard`, click **Sign out** → you return to an anonymous state.
2. Visit `/sign-in`, enter the **wrong** password → expect the generic "Invalid email or password."
3. Enter the **correct** credentials → signed in, land on `/dashboard`.
4. Enter an email with **no account** → same generic message as the wrong-password case (no
   enumeration).

**Protected-route redirect (US3)**
1. Sign out. Directly visit `/dashboard` → expect redirect to `/sign-in?callbackUrl=/dashboard`.
2. Sign in from that screen → expect to land back on `/dashboard` (the original destination).
3. While signed in, visit `/sign-in` → expect to be bounced to `/dashboard`.

**Session persistence (US4)**
1. Signed in, navigate around and **reload** the page → you stay signed in (no re-prompt).

## 5. Quality gate (before `/speckit-implement` is considered done)

```bash
npx tsc --noEmit      # strict types, no unjustified any (Principle IV)
npm run lint          # ESLint
npm run build         # next build must pass
```

Plus the manual acceptance scenarios above. (Optional: if a Vitest runner is added, unit-test
`lib/auth/password.ts` and `lib/validation/auth.ts`.)

## Security checklist (spot-check)

- [ ] Inspect the DB `User` row: `passwordHash` is a bcrypt string, **never** the plaintext (FR-004).
- [ ] Grep server logs: no plaintext password appears.
- [ ] In the browser, the session cookie is **httpOnly** (not readable from `document.cookie`).
- [ ] No `AUTH_SECRET` / DB URL in the client bundle (Principle II).
