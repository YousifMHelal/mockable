# Mockable — Build Roadmap

## Part 2 — The Constitution

> Paste the block below as the prompt to `/speckit.constitution`. These are written as
> non-negotiable principles. Trim or tighten to taste before running.

**Project:** Mockable — a web app where users run realistic, voice-based mock
interviews with an AI interviewer and receive a scored evaluation afterward.

### Core principles (non-negotiable)

1. **Stack is fixed.** Next.js (App Router) + TypeScript, Tailwind CSS for styling,
   GSAP for animation, Prisma ORM over Postgres, Auth.js (NextAuth v5) with the
   credentials provider, Vapi for the live voice interview, an LLM API (Claude or GPT)
   for post-interview scoring, deployed on Vercel. Do not introduce alternative
   frameworks, ORMs, or auth libraries without an explicit amendment to this document.

2. **No secrets in the browser.** All API keys (Vapi private key, LLM key, database
   URL) live server-side only. Any call that uses a secret goes through a Next.js
   server route or server action. The browser only ever holds Vapi's *public* key.

3. **Separation of live vs. evaluation.** Vapi owns the real-time conversation
   (speech-to-text, turn-taking, text-to-speech, live transcript). Scoring is a
   **separate, asynchronous** LLM call made after the call ends, fed the full
   transcript, returning structured JSON. These two responsibilities never merge.

4. **Type safety is mandatory.** TypeScript runs in `strict` mode. No `any` without a
   written justification comment. Prisma types are the source of truth for data shapes.

5. **Idiomatic, clean React/TS.** Functional components and hooks. Server Components by
   default; Client Components only where interactivity requires it. Light comments —
   flag the tricky bits (Vapi event handling, RTL logic), leave the obvious alone.

6. **App is English; only the interview *voice* is multilingual.** The entire app UI
   (landing, forms, dashboard, results, buttons, all copy) is English and LTR. The ONLY
   thing the chosen language changes is the AI interviewer's *spoken* language (English
   or Arabic) during the live interview. There is no app-wide translation and no
   app-wide RTL. Single exception: the live-transcript panel in the interview room must
   render Arabic text correctly (Arabic web font, e.g. Cairo/Tajawal, + RTL applied to
   that text block only) when an Arabic interview is running. Everything around it stays
   English/LTR.

7. **Design identity.** Light mode only. Colorful, animation-forward, energetic. The
   landing page is the showpiece. In-app pages stay clean and focused but still feel
   alive. Animation must never block usability or core flows.

8. **Accessibility floor.** Keyboard navigable, sensible focus states, alt text,
   sufficient contrast (verify against the colorful palette), respect
   `prefers-reduced-motion` by toning down GSAP/Framer effects.

9. **Performance floor.** Landing page targets a good Lighthouse score; animations run
   on GPU-friendly properties (transform/opacity). Lazy-load heavy animation assets.

10. **Security.** Passwords hashed with bcrypt or argon2 — never stored or logged in
    plaintext. Credentials auth uses JWT sessions (the credentials provider can't use
    DB sessions). Validate and sanitize all form input server-side.

11. **Data is owned by the user.** Users only ever read/write their own interviews and
    results. Every query is scoped by the authenticated user id.

### Quality gates

- A feature isn't done until it's type-clean and handles loading + error states.
- No phase ships with secrets reachable from the client bundle.
- `/speckit.analyze` must pass against this constitution before `/speckit.implement`.

---

## Part 3 — The Phased Roadmap

Each phase = one `/speckit.specify` slice. Phases are ordered to de-risk early and
polish late. "Done when" is your acceptance check before moving on.

### Phase 0 — Foundation
**Goal:** A deployable skeleton with the toolchain wired.
- `create-next-app` (TS, App Router, Tailwind), strict tsconfig.
- Prisma installed; the schema from our design committed (User, Account, Session,
  Interview, Result + enums); first migration run against a Postgres instance.
- Env management set up (`.env`, `.env.example`); GSAP installed.
- Deploy the empty app to Vercel so the pipeline works from day one.
**Done when:** the app builds, deploys, and `prisma migrate` succeeds.

### Phase 1 — Vapi + Arabic spike  ⚠️ de-risk first
**Goal:** Prove the riskiest part works before building around it.
- A throwaway `/spike` page with a single button that starts a Vapi call.
- Confirm: a voice call connects, you hear the AI, the live transcript streams back,
  and **Arabic STT + TTS sound acceptable** with your chosen providers (test Deepgram
  for STT and a couple of TTS voices). Confirm volume-level events fire (for the orb).
- Document which provider combo wins for Arabic.
**Done when:** you've held a real spoken exchange in both EN and AR and are happy with
the Arabic voice quality. If not, this is the cheapest possible moment to change course.

### Phase 2 — Authentication
**Goal:** Email + password sign-up and sign-in.
- Auth.js v5 with the Prisma adapter and credentials provider (JWT sessions).
- Manual sign-up flow: hash password (bcrypt/argon2), create user.
- Sign-in, sign-out, session access on server and client. Protected-route helper.
**Done when:** a user can register, log out, log back in, and protected pages redirect
unauthenticated visitors.

### Phase 3 — Create-interview flow
**Goal:** The config screen that produces an interview record.
- `/interview/new`: a button that reveals a form (type → if technical, field → language
  → difficulty). Validate server-side, write an `Interview` row (status `CREATED`).
- On submit, render the interview card with an "Enter interview" button.
- Auth gate sits here at "Enter interview," not at the first landing CTA.
**Done when:** submitting the form persists an interview and shows its card.

### Phase 4 — Interview room
**Goal:** The real, productionized interview experience.
- `/interview/[id]`: two sections — AI orb animation + mic control on one side, live
  transcript on the other.
- Build the Vapi assistant's system prompt **dynamically** from the interview config
  (type/field/language/difficulty). Auto turn-taking with a generous silence threshold;
  visible mute button as the escape hatch.
- Drive the orb animation off Vapi's volume-level events.
- The transcript panel must render Arabic text correctly (Arabic font + RTL on that
  block only) when the interview language is Arabic; the surrounding app stays English/LTR.
- On call end, persist the transcript to the `Interview` row, set status `IN_PROGRESS`
  → `COMPLETED`, store the `vapiCallId`.
**Done when:** a full interview runs end to end in the chosen language and the transcript
is saved.

### Phase 5 — Scoring + results
**Goal:** Turn a transcript into feedback.
- Server route: take the transcript, call the LLM with a scoring prompt, get back
  structured JSON (overall 0–100, per-dimension scores, summary, 2–3 improvements).
- Persist a `Result` row linked to the interview.
- `/interview/[id]/results`: render the score, dimension breakdown, and tips with some
  animated reveal.
**Done when:** finishing an interview produces and displays a saved, structured score.

### Phase 6 — Dashboard
**Goal:** The home base for returning users.
- `/dashboard`: list past interviews with status and score, links to each result, a
  "new interview" CTA. Optionally a simple score-over-time chart.
**Done when:** a user sees their full history and can re-open any past result.

### Phase 7 — Landing page (the showpiece)
**Goal:** The colorful, animation-heavy front door.
- `/`: hero with headline + primary CTA, "how it works," sample-interview preview,
  footer. GSAP + ScrollTrigger for scroll-driven sequences; animated gradient/blob hero.
- Respect `prefers-reduced-motion`. Keep it fast.
**Done when:** the page is visually distinctive, animated, performant, and the CTA routes
correctly into the create flow.

### Phase 8 — Hardening & launch
**Goal:** Production-ready.
- Error boundaries, loading skeletons, empty states, rate limiting on the costly Vapi/LLM
  routes, accessibility audit, Lighthouse pass, final Vercel config + env review.
**Done when:** the app handles failure gracefully and passes your quality gates.

