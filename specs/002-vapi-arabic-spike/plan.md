# Implementation Plan: Phase 1 — Vapi + Arabic Spike

**Branch**: `002-vapi-arabic-spike` | **Date**: 2026-06-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-vapi-arabic-spike/spec.md`

## Summary

Build a throwaway `/spike` page that drives the **Vapi Web SDK** from the browser to hold a
live, two-way voice interview, streams the transcript in real time, and surfaces volume-level
events. The page lets the evaluator pick the language (English / Egyptian Arabic) and, for
Arabic, the TTS provider/voice (ElevenLabs vs Azure) so the two can be compared head-to-head.
Arabic STT uses Deepgram. The lasting deliverable is a written recommendation naming the
winning Arabic STT + TTS combo. This phase de-risks the riskiest product assumption — that
Egyptian-Arabic voice is good enough — before the real interview room is built (Phase 4).

**Technical approach**: A single Client Component page wires the Vapi SDK events
(`call-start`, `message`/transcript, `volume-level`, `call-end`, `error`) to React state.
The conversational assistant is configured as a **transient assistant** (built per
language/voice selection), with the LLM, Deepgram transcriber, and ElevenLabs/Azure voice
referenced by config; all provider **API keys live in the Vapi dashboard**, so the browser
holds only the public Vapi key (Principle II). The Arabic transcript block renders RTL in an
Arabic web font (Cairo) while the rest of the page stays English/LTR (Principle VI).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node 20 LTS; React 19 / Next.js 15 (App
Router) from the Phase 0 skeleton.

**Primary Dependencies**: `@vapi-ai/web` (Vapi browser SDK — **new** this phase); existing
Next.js 15, React 19, Tailwind v4; `next/font` (Google) for the Cairo Arabic font. GSAP is
*not* used here (the orb is a plain meter for the spike).

**Storage**: None. The spike persists nothing — no database writes, no `Interview`/`Result`
rows. All transcript/volume state is ephemeral, in React memory, discarded on unload
(FR-012).

**External Providers** (configured in the **Vapi dashboard**, not app env):
- Live voice orchestration: **Vapi**
- STT: **Deepgram** (`language: "ar"` for Arabic; `en` for English)
- TTS: **ElevenLabs** (multilingual model) and **Azure** (Egyptian voices `ar-EG-*`)
- Conversational LLM: a fast model (e.g. GPT-4o-mini or Claude Haiku) with a generic
  interviewer prompt; spoken-language instruction injected per selection.

**Testing**: Manual, evaluator-driven acceptance — a real spoken exchange in EN and Egyptian
AR, judged go/no-go (matches the spec's human acceptance gate). Automated gate is
type-cleanliness: `tsc --noEmit` and `next build` must pass. No unit/integration suite for a
throwaway page (justified — disposable spike).

**Target Platform**: Modern desktop browser with a microphone (WebRTC). Runs on local dev and
the existing Vercel deployment.

**Project Type**: Web application (single Next.js full-stack project) — same structure as
Phase 0; this adds one route and a little lib code.

**Performance Goals**: Live transcript text appears within ~2s of speech (SC-003) — driven by
Vapi/Deepgram streaming, not our code. No Lighthouse/animation budget (internal page).

**Constraints**: Browser holds only `NEXT_PUBLIC_VAPI_PUBLIC_KEY` (Principle II); UI stays
English/LTR with the Arabic transcript block the sole RTL exception (Principle VI); strict TS,
Vapi event payloads typed, no unjustified `any` (Principle IV).

**Scale/Scope**: One evaluator at a time, one throwaway page, a handful of lib helpers, one
findings doc. No multi-user, no scale concerns.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Relevance to this phase | Status |
|-----------|------------------------|--------|
| I. Fixed Stack | Uses the mandated Vapi for live voice + an allowed LLM; Deepgram/ElevenLabs/Azure are sub-providers *under* Vapi, not stack substitutions | ✅ PASS |
| II. No Secrets in Browser | Browser holds only the public Vapi key; Deepgram/TTS/LLM keys live in the Vapi dashboard (resolved server-side by Vapi). No secret reaches the client bundle | ✅ PASS |
| III. Live vs. Evaluation | Spike is **live-only**; no scoring/LLM-evaluation call exists here (NFR-002) | ✅ PASS (scoring N/A) |
| IV. Type Safety | `strict` stays on; Vapi message/volume/error events are given explicit types; any `any` carries a justification comment | ✅ PASS |
| V. Idiomatic React/TS | The page is a Client Component **by necessity** (browser voice SDK + live state); functional + hooks, Server-Component default respected elsewhere | ✅ PASS |
| VI. English app, AR voice only | UI is English/LTR; only the spoken language and the live-transcript block vary — Arabic transcript gets Cairo + `dir="rtl"` scoped to that block | ✅ PASS (directly exercised) |
| VII. Design Identity | Throwaway page: minimal, clean, light-mode; the "orb" is a simple volume meter, no heavy animation. Not the showpiece | ✅ N/A (disposable) |
| VIII. Accessibility Floor | Start/stop/select controls are keyboard-focusable with visible focus; no GSAP, so `prefers-reduced-motion` is moot | ✅ PASS (basic floor) |
| IX. Performance Floor | Internal page, no landing-page budget; no heavy assets | ✅ N/A |
| X. Security | No auth, no passwords, no persisted form input — nothing to hash or sanitize for storage | ✅ N/A (no credentials/data) |
| XI. User-Owned Data | Nothing persisted, so no cross-user data exposure surface | ✅ N/A (no data) |

**Result**: No violations. Client Component use (Principle V) and N/A items (VII/IX/X/XI) are
inherent to a disposable, persistence-free voice spike — Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-vapi-arabic-spike/
├── plan.md              # This file
├── research.md          # Phase 0 output — Vapi SDK, provider, Arabic-dialect decisions
├── data-model.md        # Phase 1 output — ephemeral (in-memory) shapes; NO persistence
├── quickstart.md        # Phase 1 output — configure Vapi keys → run → evaluate
├── contracts/
│   └── vapi-events.md    # The Vapi SDK event/config contract the page depends on
├── findings.md          # US4 deliverable — written winning-combo recommendation (filled
│                         #   during implementation, after the live exchanges)
└── checklists/
    └── requirements.md  # Spec quality checklist (from /speckit-specify)
```

### Source Code (repository root)

```text
mockable/
├── app/
│   └── spike/
│       └── page.tsx          # 'use client' throwaway page: controls + transcript + meter,
│                             #   wires Vapi events to state (US1, US2, US3)
├── lib/
│   └── spike/
│       ├── voices.ts         # Candidate catalog: EN voice + AR ElevenLabs/Azure voices
│       └── assistant.ts      # Builds a transient Vapi assistant config per language+voice
│                             #   (LLM + Deepgram transcriber + selected voice + prompt)
├── .env.example              # (unchanged) NEXT_PUBLIC_VAPI_PUBLIC_KEY already present
└── package.json              # + @vapi-ai/web dependency
```

**Structure Decision**: Reuses the Phase 0 single Next.js project. The spike is isolated
under `app/spike/` and `lib/spike/` so it is trivial to delete wholesale when Phase 4 replaces
it (FR-012). No product code (auth, Prisma models, dashboard) is touched.

## Complexity Tracking

> No constitution violations — section intentionally empty.
