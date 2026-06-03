---
description: "Task list for Phase 1 — Vapi + Arabic Spike"
---

# Tasks: Phase 1 — Vapi + Arabic Spike

**Input**: Design documents from `/specs/002-vapi-arabic-spike/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/vapi-events.md, quickstart.md

**Tests**: None. The spec's acceptance is a manual, evaluator-driven go/no-go on Egyptian-Arabic
voice quality (a de-risking spike); no automated unit/integration suite is generated. The only
automated gate is type-cleanliness (`tsc --noEmit` + `next build`), captured in Polish.

**Organization**: Tasks grouped by user story. US1 (English voice path) is the MVP; US2 (Egyptian
Arabic) is the actual de-risk and, with US1, defines "done" per the roadmap.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US4 maps to the spec's user stories
- All paths are repository-root-relative (`mockable/`)

## Path Conventions

Single Next.js full-stack project (Phase 0 skeleton). Spike code is isolated under `app/spike/`
and `lib/spike/` for clean deletion in Phase 4.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pull in the one new dependency and confirm provider credentials exist.

- [X] T001 Install the Vapi browser SDK: `npm install @vapi-ai/web` (updates `package.json` / `package-lock.json`)
- [X] T002 Configure provider keys in the **Vapi dashboard** (Deepgram, ElevenLabs, Azure Speech, LLM) and confirm `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is set in `.env` (already declared in `.env.example`); no provider key is added to app env (Principle II) — per `specs/002-vapi-arabic-spike/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared catalog, assistant builder, and page shell every story binds to.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create the voice catalog in `lib/spike/voices.ts`: a typed `VoiceOption[]` (per data-model.md) with ≥1 English voice, ≥1 Arabic **ElevenLabs** voice, and ≥1 Arabic **Azure** Egyptian voice (`ar-EG-SalmaNeural`/`ar-EG-ShakirNeural`), plus the `Language` type
- [X] T004 [P] Create the transient-assistant builder in `lib/spike/assistant.ts`: `buildAssistant(language, voice)` returning an `AssistantConfig` (LLM `model` + generic interviewer prompt, Deepgram `transcriber`, selected `voice`, optional `firstMessage`) — providers referenced by name only, **no API keys** (Decision 2 / contracts)
- [X] T005 Create the page shell in `app/spike/page.tsx`: `'use client'`, a singleton `Vapi(NEXT_PUBLIC_VAPI_PUBLIC_KEY)` client, the `CallState` state machine, Start/Stop controls, and a language `<select>` (English default) — imports T003/T004 (depends on T003, T004)

**Checkpoint**: The page renders with controls; calls can be started/stopped (no transcript/meter yet).

---

## Phase 3: User Story 1 - Live voice exchange with streaming transcript (Priority: P1) 🎯 MVP

**Goal**: Hold a real two-way English voice call with a live, streaming transcript and a clean end.

**Independent Test**: Open `/spike`, press Start, speak ≥3 turns in English — hear the AI, see both
sides stream into the transcript, press Stop and return to idle, all without reload.

### Implementation for User Story 1

- [X] T006 [US1] Wire Vapi lifecycle + failure handling in `app/spike/page.tsx`: `call-start` → `active`, `call-end` → `idle`, and `error` event + denied-mic-permission rejection → a clear, **retryable** `error` state (FR-002, FR-010)
- [X] T007 [US1] Implement live transcript state in `app/spike/page.tsx` from `message` (`type:"transcript"`) events: upsert `TranscriptEntry` by role, partials replace the in-progress line, finals commit (FR-003, per data-model.md)
- [X] T008 [US1] Render the transcript panel (LTR) plus call-status / error messaging in `app/spike/page.tsx`
- [X] T009 [US1] Validate English end to end per quickstart: connect, ≥3 turns stream live (within ~2s), Stop → idle (SC-001, SC-003)

**Checkpoint**: A complete English voice exchange works and is independently demoable (MVP).

---

## Phase 4: User Story 2 - Validate Egyptian-Arabic voice quality (Priority: P1)

**Goal**: Run the exchange in Egyptian Arabic, compare ElevenLabs vs Azure voices, and render the
Arabic transcript RTL — the core de-risk.

**Independent Test**: Set language = Arabic, speak Egyptian Arabic — the AI understands and replies
in Arabic, the transcript renders RTL in Cairo while the page stays English/LTR, and both an Azure
`ar-EG` voice and an ElevenLabs voice can be heard in one session.

### Implementation for User Story 2

- [X] T010 [P] [US2] Load the **Cairo** Arabic font via `next/font/google` in `lib/spike/fonts.ts` and export it for scoped use
- [X] T011 [US2] Ensure Arabic runs pass `transcriber.language:"ar"` and an Egyptian-Arabic (Masri) spoken-language instruction through `buildAssistant` in `lib/spike/assistant.ts` (Decision 3, Decision 5)
- [X] T012 [US2] Add the Arabic voice-provider selector (ElevenLabs vs Azure) shown when language = Arabic, wired to the catalog, in `app/spike/page.tsx` (FR-006, SC-005)
- [X] T013 [US2] Render Arabic transcript entries with `dir="rtl"` and the Cairo font **scoped to the transcript block only**, keeping the surrounding page English/LTR, in `app/spike/page.tsx` (FR-007, Principle VI, SC-004)
- [ ] T014 [US2] Validate Egyptian-Arabic end to end per quickstart: ≥3 turns, recognition usable, RTL/Cairo correct, switch Azure ↔ ElevenLabs within one session (SC-002, SC-004, SC-005)

**Checkpoint**: English and Egyptian-Arabic exchanges both work; voices are comparable side by side.

---

## Phase 5: User Story 3 - Volume-level events for the future orb (Priority: P2)

**Goal**: Prove the `volume-level` data feed exists by driving a simple live meter.

**Independent Test**: During a call, a visible meter reacts to the AI's speaking volume in real time
and settles toward zero on silence.

### Implementation for User Story 3

- [X] T015 [US3] Subscribe to `vapi.on("volume-level", …)` and store `volumeLevel` (0..1) in `app/spike/page.tsx` (FR-008)
- [X] T016 [US3] Render a lightweight CSS volume meter that reacts in real time and settles to zero on silence in `app/spike/page.tsx` (SC-006)
- [X] T017 [US3] Validate the meter visibly reacts while the AI speaks (manual, per quickstart)

**Checkpoint**: The orb data feed is confirmed usable for Phase 4.

---

## Phase 6: User Story 4 - Record the winning Arabic provider combination (Priority: P3)

**Goal**: Capture the durable go/no-go recommendation.

**Independent Test**: A written doc names the chosen Egyptian-Arabic STT + TTS combo and the
reasoning, readable without rerunning the spike.

### Implementation for User Story 4

- [X] T018 [US4] Create the findings template at `specs/002-vapi-arabic-spike/findings.md` with sections: STT verdict (Deepgram + Egyptian Arabic), TTS winner (provider/voice), go/no-go, reasoning, next steps if no-go
- [X] T019 [US4] After evaluation, fill `specs/002-vapi-arabic-spike/findings.md` with the recorded winning combo and Egyptian-Arabic quality verdict (FR-011, SC-007)

**Checkpoint**: The lasting deliverable — the provider decision — is recorded.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Type-clean gate, accessibility floor, secret check, full validation.

- [X] T020 [P] Confirm the type-clean gate passes: `npx tsc --noEmit` and `npm run build` (Principle IV)
- [X] T021 [P] Accessibility floor in `app/spike/page.tsx`: Start/Stop/select controls keyboard-focusable with visible focus states (Principle VIII)
- [X] T022 Verify no secret reaches the client bundle — only `NEXT_PUBLIC_VAPI_PUBLIC_KEY` is referenced client-side; review `app/spike/` and `lib/spike/` imports (Principle II)
- [ ] T023 Run the full `specs/002-vapi-arabic-spike/quickstart.md` validation, including the failure paths (denied mic, mid-call drop) → retryable error state (FR-010)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**.
- **User Stories (Phase 3–6)**: All depend on Foundational. US1 is the MVP; US2 is the de-risk goal.
- **Polish (Phase 7)**: After the desired stories are complete.

### User Story Dependencies

- **US1 (P1)**: After Foundational. No dependency on other stories — independently testable.
- **US2 (P1)**: After Foundational. Reuses the US1 transcript path but adds Arabic/RTL/voice-compare;
  testable on its own by selecting Arabic. (Practically, build on US1's transcript.)
- **US3 (P2)**: After Foundational. Independent — only adds the meter.
- **US4 (P3)**: After US1+US2 exchanges have actually been run (the verdict needs real evaluation).

### Within Each User Story

- Most US tasks edit the single file `app/spike/page.tsx` and are therefore **sequential**.
- Catalog/builder/fonts (`lib/spike/*`) are separate files and can be done in parallel where marked.

### Parallel Opportunities

- **Foundational**: T003 (`voices.ts`) and T004 (`assistant.ts`) run in parallel `[P]`; T005 follows.
- **US2**: T010 (`lib/spike/fonts.ts`) `[P]` can be created independently before T013 consumes it.
- **Polish**: T020 and T021 `[P]`.
- Within a story, page-editing tasks are not parallel (same file).

---

## Parallel Example: Foundational Phase

```bash
# Different files, no inter-dependency — run together:
Task: "Create voice catalog in lib/spike/voices.ts"      # T003
Task: "Create assistant builder in lib/spike/assistant.ts"  # T004
# Then, after both land:
Task: "Create the spike page shell in app/spike/page.tsx"   # T005
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 Setup → 2. Phase 2 Foundational → 3. Phase 3 US1.
4. **STOP and VALIDATE**: a real English voice exchange with live transcript (SC-001, SC-003).

### The actual de-risk (do not stop at MVP)

The roadmap's "done when" requires Egyptian Arabic too. After US1, do **US2** and judge Egyptian-Arabic
voice quality — this is the cheapest moment to change course if it's unacceptable.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. US1 → English exchange (MVP demo).
3. US2 → Egyptian-Arabic exchange + voice comparison (the de-risk).
4. US3 → volume meter (orb feed confirmed).
5. US4 → record the verdict in `findings.md`.
6. Polish → type-clean, a11y floor, secret check, full quickstart.

---

## Notes

- `[P]` = different files, no dependencies; same-file page tasks stay sequential.
- The whole spike (`app/spike/`, `lib/spike/`, the `@vapi-ai/web` dep) is disposable and removed in
  Phase 4; `findings.md` is the durable record.
- No secrets in app env or browser beyond `NEXT_PUBLIC_VAPI_PUBLIC_KEY` (Principle II).
- Commit after each task or logical group.
