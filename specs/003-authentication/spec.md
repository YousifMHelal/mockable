# Feature Specification: Phase 2 — Authentication

**Feature Branch**: `003-authentication`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "phase 2 mockable-roadmap.md"

## Overview

This phase gives Mockable its first real users. Today the app has no notion of identity:
anyone can reach any page, and nothing a person does can be tied back to them. Phase 2
introduces email-and-password accounts so people can register, sign in, sign out, and stay
recognized as they move through the app. It also adds the gate that later phases depend on —
pages that should only be seen by a signed-in user must turn away anyone who is not.

This is foundational plumbing, not a user-facing showpiece. The interview-creation flow
(Phase 3), the interview room (Phase 4), results (Phase 5), and the dashboard (Phase 6) all
assume there is a known, authenticated user whose work can be saved against their account.
Phase 2 makes that assumption true. The visible surface is small — a sign-up screen, a
sign-in screen, a way to sign out, and the redirect behavior that protects gated pages — but
everything after it leans on this being correct and secure.

## Clarifications

### Session 2026-06-03

- Q: Does sign-up capture a display name, or just email + password? → A: Sign-up collects
  name + email + password; the name is required.
- Q: How long should a session last before it expires? → A: 30 days, rolling/sliding — each
  visit refreshes the expiry, so continued activity keeps the user signed in.
- Q: What is the password strength rule? → A: Minimum 8 characters, with no required character
  types (length-based, per modern NIST guidance).
- Q: Where does a user land after sign-up/sign-in when not redirected from a protected page? →
  A: The dashboard route, served as a placeholder until Phase 6 builds the real dashboard.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register a new account (Priority: P1)

A first-time visitor creates an account by providing their name, an email address, and a
password. After
submitting valid details, they have an account and are recognized as signed in, ready to use
the app.

**Why this priority**: Without registration there are no users at all. Every other capability
in this phase and every later phase depends on an account existing. This is the entry point to
the entire product.

**Independent Test**: Open the sign-up screen, enter a new, unused email and a valid password,
submit, and confirm an account is created and the person is treated as authenticated (they can
reach a page that requires sign-in without being redirected away).

**Acceptance Scenarios**:

1. **Given** the sign-up screen with no existing account for the entered email, **When** the
   visitor submits a valid email and a password that meets the strength rules, **Then** an
   account is created and they are recognized as signed in.
2. **Given** the sign-up screen, **When** the visitor submits an email that already belongs to
   an existing account, **Then** registration is refused with a clear message and no duplicate
   account is created.
3. **Given** the sign-up screen, **When** the visitor submits a malformed email or a password
   that fails the strength rules, **Then** the form is rejected with a specific, actionable
   validation message and no account is created.

---

### User Story 2 - Sign in to an existing account (Priority: P1)

A returning user who already has an account enters their email and password and is signed in,
regaining their recognized identity.

**Why this priority**: An account is only useful if its owner can come back to it. Sign-in is
the other half of the core authentication loop and is required for the "log out, log back in"
acceptance bar of this phase.

**Independent Test**: With an account that already exists, open the sign-in screen, enter the
correct credentials, submit, and confirm the user is recognized as signed in; then repeat with
a wrong password and confirm sign-in is refused.

**Acceptance Scenarios**:

1. **Given** an existing account, **When** the user submits the correct email and password,
   **Then** they are signed in and recognized as authenticated.
2. **Given** an existing account, **When** the user submits the correct email but a wrong
   password, **Then** sign-in is refused with a generic failure message that does not reveal
   whether the email exists.
3. **Given** an email with no account, **When** someone submits any password for it, **Then**
   sign-in is refused with the same generic failure message used for a wrong password.

---

### User Story 3 - Gated pages turn away unauthenticated visitors (Priority: P1)

When someone who is not signed in tries to open a page that requires an account, they are sent
to the sign-in screen instead of seeing protected content. After signing in, they continue to
where they were trying to go.

**Why this priority**: The whole point of identity is to protect per-user content. Later phases
(interview room, results, dashboard) must be unreachable to anonymous visitors. This redirect
behavior is part of the explicit "Done when" bar for the phase and must exist before those
pages are built.

**Independent Test**: While signed out, attempt to open a protected page directly by URL and
confirm a redirect to sign-in; then sign in and confirm access is granted (and, ideally, that
the original destination is reached).

**Acceptance Scenarios**:

1. **Given** a visitor who is not signed in, **When** they request a protected page, **Then**
   they are redirected to the sign-in screen rather than shown the protected content.
2. **Given** a visitor who was redirected to sign-in from a protected page, **When** they sign
   in successfully, **Then** they arrive at the page they originally requested.
3. **Given** a signed-in user, **When** they request a protected page, **Then** the page is
   shown without a redirect.

---

### User Story 4 - Sign out and persistent sessions (Priority: P2)

A signed-in user can sign out at any time, which ends their session and returns them to an
anonymous state. While signed in, their session persists as they navigate and across page
reloads, so they are not asked to sign in again on every page.

**Why this priority**: Sign-out completes the round trip required by the phase's acceptance bar
("log out, log back in"), and persistent sessions are what make a signed-in experience usable
rather than a per-request annoyance. It is P2 only because sign-up and sign-in must work first.

**Independent Test**: Sign in, navigate between pages and reload to confirm the session sticks,
then sign out and confirm that protected pages once again redirect to sign-in.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they navigate between pages or reload, **Then** they
   remain signed in without re-entering credentials.
2. **Given** a signed-in user, **When** they sign out, **Then** their session ends and they are
   returned to an anonymous state.
3. **Given** a user who has just signed out, **When** they request a protected page, **Then**
   they are redirected to the sign-in screen.

---

### Edge Cases

- **Duplicate registration race**: two sign-up attempts for the same email submitted nearly
  simultaneously — only one account may be created; the second must fail cleanly.
- **Email casing/whitespace**: the same address with different capitalization or surrounding
  spaces (e.g. ` User@Example.com `) must be treated as the same account, not a new one.
- **Already-signed-in user visits sign-in/sign-up**: the app should send them onward rather than
  showing the auth forms again.
- **Expired or tampered session**: a session token that is invalid, altered, or past its lifetime
  must be treated as not-signed-in, redirecting to sign-in rather than granting access.
- **Empty or whitespace-only fields**: submitting blank email or password must be rejected by
  validation, not produce a server error.
- **Wrong credentials must not reveal account existence**: error messaging must be identical
  whether the email is unknown or the password is simply wrong.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let a new visitor register an account by providing a display name,
  an email address, and a password.
- **FR-002**: The system MUST validate that a non-empty display name is provided, that the
  submitted email is well-formed, and that the password is at least 8 characters long (the
  sole strength rule — no required character types) before creating an account.
- **FR-003**: The system MUST reject registration when an account already exists for the
  submitted email, treating email comparison as case-insensitive and trimming surrounding
  whitespace, so that email is unique per account.
- **FR-004**: The system MUST never store a password in recoverable form; passwords MUST be
  stored only as a salted one-way hash, and a plaintext password MUST never be persisted or
  logged.
- **FR-005**: The system MUST let a returning user sign in with their email and password and be
  recognized as authenticated on success.
- **FR-006**: The system MUST refuse sign-in for incorrect credentials and MUST return a generic
  failure message that does not reveal whether the email is registered (no account enumeration).
- **FR-007**: The system MUST establish a session upon successful sign-up and upon successful
  sign-in, and that session MUST persist across navigation and page reloads until it expires or
  the user signs out. The session expiry MUST be 30 days on a rolling basis — user activity
  refreshes the expiry window, so a continuously active user is not signed out.
- **FR-008**: The system MUST let a signed-in user sign out, ending their session and returning
  them to an anonymous state.
- **FR-009**: The current user's authenticated identity MUST be readable both during server-side
  rendering/handling and on the client, so any page or action can know who (if anyone) is
  signed in.
- **FR-010**: The system MUST provide a reusable way to mark a page or route as protected such
  that an unauthenticated request to it is redirected to the sign-in screen instead of being
  served the protected content.
- **FR-011**: After an unauthenticated visitor is redirected to sign-in from a protected page, a
  successful sign-in SHOULD return them to the page they originally requested.
- **FR-015**: When a user signs up or signs in without a pending original destination, the system
  MUST send them to the dashboard route. Until Phase 6 builds the dashboard, that route MAY be a
  minimal authenticated placeholder, but it MUST be a protected page (subject to FR-010).
- **FR-012**: The system MUST treat an invalid, tampered, or expired session as unauthenticated.
- **FR-013**: All credential handling — hashing, verification, account creation, and session
  issuance — MUST occur server-side; no secret or password-handling logic may run in the
  browser.
- **FR-014**: Form-level validation errors MUST be surfaced to the user with specific, actionable
  messages, and invalid input MUST NOT cause an unhandled server error.

### Key Entities *(include if feature involves data)*

- **User**: A person with an account. Identified by a unique email address; holds a required
  display name and the salted password hash. The owner to which all later per-user data
  (interviews, results) will be attached. (The data model for User already exists from Phase 0.)
- **Session**: The representation of a currently-authenticated user across requests. Has a
  lifetime, can be ended by sign-out, and is considered invalid once expired or tampered with.
- **Credentials**: The transient email-and-password pair a user submits to register or sign in.
  Never persisted as-is; the password becomes a one-way hash and is otherwise discarded.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new visitor can go from the sign-up screen to a created, signed-in account in
  under 60 seconds with no errors when providing valid details.
- **SC-002**: A user can complete the full round trip — register, sign out, and sign back in with
  the same credentials — and be recognized as the same account each time, 100% of the time.
- **SC-003**: 100% of unauthenticated attempts to open a protected page result in a redirect to
  sign-in; protected content is never served to an anonymous request.
- **SC-004**: No password is ever stored or logged in recoverable form — a review of stored data
  and logs shows only hashes, in 100% of cases.
- **SC-005**: Sign-in failures for an unknown email and for a wrong password are indistinguishable
  to the user (identical messaging and behavior), preventing account enumeration.
- **SC-006**: A signed-in user remains signed in across page navigation and at least one full
  page reload without re-entering credentials.
- **SC-007**: Invalid sign-up or sign-in input (malformed email, weak password, blank fields,
  duplicate email) is rejected with a clear validation message and never produces an unhandled
  server error.

## Assumptions

- **Email + password only**: This phase implements manual email/password authentication only.
  Social/OAuth providers, magic links, and SSO are out of scope (and would require a constitution
  amendment to the fixed stack).
- **No email verification or password reset in this phase**: Account creation does not require
  confirming the email address, and "forgot password" / reset flows are deferred to a later
  phase. This matches the roadmap's "create user" framing for Phase 2.
- **Password strength rule**: Passwords must be at least 8 characters, with no required
  character types (see FR-002); this can be tightened later without changing the shape of the
  feature.
- **Protected pages exist later**: The pages this phase protects (dashboard, interview room,
  results) are built in later phases. Phase 2 delivers the protection mechanism and demonstrates
  it against at least one gated route — the dashboard route, served as a minimal authenticated
  placeholder (post-auth landing target, see FR-015) until Phase 6 builds it out.
- **Session model**: Sessions are token-based and stateless (no server-side session lookup
  required to validate a request), consistent with the project's fixed stack, with a 30-day
  rolling expiry (see FR-007).
- **Rate limiting / brute-force hardening is deferred**: Throttling repeated sign-in attempts and
  related abuse protections are part of the later hardening phase, not this one, beyond the basic
  no-enumeration requirement.
- **Existing data model is reused**: The User/Account/Session schema committed in Phase 0 is the
  basis for stored identity; this phase does not redesign it.

## Dependencies

- Phase 0 (Foundation) — provides the deployable app, the database, and the User/Account/Session
  data model that accounts are written into.
- An available, migrated Postgres database to persist accounts.
