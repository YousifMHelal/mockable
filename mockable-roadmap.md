 The Phased Roadmap

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

