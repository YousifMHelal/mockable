# Feature Specification: Phase 1 — Vapi + Arabic Spike

**Feature Branch**: `002-vapi-arabic-spike`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "phase 1 mockable-roadmap.md"

## Overview

This is a **de-risking spike**, not a product feature. Before building the real interview
experience around Vapi (Phases 4–5), we must prove the riskiest assumption: that a live,
voice-based AI interview works end to end and — critically — that **Arabic speech-to-text
and text-to-speech are good enough** with our chosen providers. The deliverable is a
throwaway evaluation page plus a written provider recommendation. If Arabic voice quality
is unacceptable, this is the cheapest possible moment to change course.

Everything produced here is intentionally disposable: the spike page is not part of the
product, is not linked from navigation, and will be removed (or replaced) once the real
interview room is built.

## Clarifications

### Session 2026-06-03

- Q: Which Arabic variety should the spike target for STT/TTS evaluation? → A: Egyptian
  Arabic — quality is judged against spoken Egyptian Arabic (the realistic target user base).
- Q: Which Arabic text-to-speech provider(s) should the spike compare? → A: ElevenLabs and
  Azure — a head-to-head comparison across both providers' Arabic voices.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hold a live voice exchange with streaming transcript (Priority: P1)

As the builder evaluating the stack, I open a single throwaway page, press one button, and
have a real spoken back-and-forth with the AI interviewer in English: I hear the AI speak,
it hears me, and the transcript of both sides streams onto the screen as we talk. I can end
the call cleanly.

**Why this priority**: This is the foundational connectivity proof. If a voice call cannot
connect, stream audio both ways, and surface a live transcript, nothing else in the product
is possible. It is the minimum viable demonstration and a prerequisite for evaluating
Arabic.

**Independent Test**: Open the spike page, start a call, speak a few sentences, confirm the
AI responds audibly and the live transcript updates for both speakers, then end the call —
all without a page reload or manual refresh.

**Acceptance Scenarios**:

1. **Given** the spike page is open, **When** the builder presses the start button, **Then**
   a voice call connects and the AI greets them audibly within a few seconds.
2. **Given** an active call, **When** the builder speaks, **Then** their words and the AI's
   replies appear in the live transcript panel as the conversation proceeds.
3. **Given** an active call, **When** the builder presses the end/stop control, **Then** the
   call disconnects cleanly and the page returns to an idle state ready to start again.

---

### User Story 2 - Validate Arabic voice quality (Priority: P1)

As the builder, I run the same spoken exchange in **Egyptian Arabic** so I can judge whether
Arabic speech recognition (what the AI understands me to have said) and Arabic speech
synthesis (how the AI sounds) are acceptable for a real interview. I can compare Arabic TTS
voices from ElevenLabs and Azure to pick the best one.

**Why this priority**: Arabic quality is the entire reason this spike exists and is the
single biggest unknown in the product. A go/no-go decision on the stack depends on it.

**Independent Test**: With the language set to Arabic, hold a spoken exchange, confirm the
AI understands spoken Arabic and replies in natural-sounding Arabic, switch between the
candidate Arabic TTS voices, and form a clear judgement on acceptability.

**Acceptance Scenarios**:

1. **Given** the spike configured for Arabic, **When** the builder speaks Arabic, **Then**
   the recognized text in the transcript reflects what they said with usable accuracy.
2. **Given** the spike configured for Arabic, **When** the AI replies, **Then** it speaks
   intelligible, natural-sounding Arabic.
3. **Given** the spike offers Arabic TTS voices from both ElevenLabs and Azure, **When** the
   builder switches between them, **Then** each voice can be heard within the same evaluation
   session so the providers can be compared directly.
4. **Given** an Arabic exchange is running, **When** Arabic text appears in the transcript
   panel, **Then** it renders in a correct Arabic web font and right-to-left, while the rest
   of the page stays English and left-to-right.

---

### User Story 3 - Observe volume-level events for the future orb (Priority: P2)

As the builder, I can confirm that the call emits real-time volume/amplitude events while
the AI is speaking, because a later phase will drive an animated "orb" off those events.

**Why this priority**: The orb is a signature piece of the interview room's design, but it
is downstream. Confirming the data feed exists now avoids a nasty surprise in Phase 4
without blocking the core voice proof.

**Independent Test**: During an active call, observe a visible indicator (e.g., a numeric
readout or a simple animated meter) that reacts to the AI's speaking volume in real time.

**Acceptance Scenarios**:

1. **Given** an active call, **When** the AI is speaking, **Then** volume-level events are
   received continuously and reflected in a visible on-screen indicator.
2. **Given** an active call, **When** no one is speaking, **Then** the volume indicator
   settles toward its resting/zero state.

---

### User Story 4 - Record the winning Arabic provider combination (Priority: P3)

As the builder, I capture a short written conclusion naming which speech-to-text and
text-to-speech provider/voice combination wins for Arabic, with brief reasoning, so the
decision is durable and feeds the real interview room.

**Why this priority**: The spike's lasting value is the documented decision, not the
throwaway page. It is last because it can only be written after the exchanges in US1–US2.

**Independent Test**: A short written document exists in the repository naming the chosen
Arabic STT and TTS providers/voices and the rationale, readable without rerunning the spike.

**Acceptance Scenarios**:

1. **Given** the Arabic evaluation is complete, **When** the builder finishes, **Then** a
   written recommendation records the winning STT + TTS combo and why it was chosen over the
   alternatives tested.

---

### Edge Cases

- **Microphone permission denied or unavailable**: the page surfaces a clear message rather
  than silently failing, so the evaluator knows why no call started.
- **Call fails to connect / network drop mid-call**: the page returns to a recoverable idle
  state and the builder can retry, rather than hanging in a broken state.
- **Mixed-language speech** (e.g., English words spoken during an Arabic session): the
  transcript still renders without breaking layout, even if recognition accuracy degrades.
- **Long silence / no speech**: the call does not crash; the volume indicator rests and the
  builder can still end the call.
- **Provider returns poor Arabic** (garbled characters, wrong dialect, robotic voice): this
  is a *valid, recorded outcome* — the spike must make such a failure visible so a no-go
  decision can be made, not hide it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a single, throwaway evaluation page (separate from any
  product flow, not linked in navigation) that starts a live voice call from one obvious
  control.
- **FR-002**: The system MUST establish a two-way live voice call in which the evaluator
  hears the AI interviewer and the AI hears the evaluator.
- **FR-003**: The system MUST display a live transcript that updates in real time with both
  the evaluator's and the AI's utterances during the call.
- **FR-004**: The system MUST allow the evaluator to end the call cleanly and return the
  page to an idle state from which a new call can be started.
- **FR-005**: The system MUST support running the exchange in **both English and Arabic**,
  with a way for the evaluator to choose which language to test.
- **FR-006**: For Arabic, the target variety is **Egyptian Arabic**; the system MUST use the
  team's candidate speech-to-text provider (Deepgram is the starting candidate) and MUST
  allow Arabic text-to-speech voices from **both ElevenLabs and Azure** to be tried and
  compared within the evaluation (at least one voice per provider).
- **FR-007**: When Arabic text is shown in the transcript, the system MUST render it in a
  correct Arabic web font and right-to-left for that text block only, while the surrounding
  page remains English and left-to-right (per Constitution Principle VI).
- **FR-008**: The system MUST surface real-time volume/amplitude events from the call in a
  visible indicator, demonstrating the data feed a future animated orb will consume.
- **FR-009**: The system MUST keep all provider secrets server-side; the browser MUST only
  ever hold the public voice key (per Constitution Principle II). Any call requiring a secret
  MUST go through a server route or server action.
- **FR-010**: The system MUST handle the failure cases (denied microphone permission, failed
  connection, mid-call drop) by showing the evaluator a clear state rather than failing
  silently.
- **FR-011**: The deliverables MUST include a written recommendation recording the winning
  Arabic STT + TTS provider/voice combination and the reasoning behind it.
- **FR-012**: The spike MUST NOT persist interview data, require authentication, or integrate
  with the production data model; it is disposable and isolated from product features.

### Non-Functional / Constraints

- **NFR-001**: The page UI (labels, buttons, instructions) MUST be English and left-to-right;
  only spoken language and the Arabic transcript block vary (Constitution Principle VI).
- **NFR-002**: Scoring/evaluation of the conversation is explicitly **out of scope** — this
  spike covers only the live voice path, not post-call LLM scoring (Constitution Principle
  III keeps those separate).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The evaluator completes a spoken exchange of at least three back-and-forth
  turns in **English** with no disconnects and a transcript that tracks the conversation.
- **SC-002**: The evaluator completes a spoken exchange of at least three back-and-forth
  turns in **Egyptian Arabic**, with the AI understanding spoken Egyptian Arabic and replying
  in Arabic.
- **SC-003**: Live transcript text for a spoken utterance appears on screen within roughly
  two seconds of it being spoken, fast enough to feel "live."
- **SC-004**: Arabic transcript text renders in correct Arabic script, right-to-left, with no
  garbled/placeholder characters, while the rest of the page stays English/LTR.
- **SC-005**: At least one ElevenLabs and one Azure Arabic TTS voice are heard and compared
  within a single evaluation session.
- **SC-006**: Volume-level events are observed driving a visible indicator in real time while
  the AI speaks.
- **SC-007**: A written go/no-go conclusion exists naming the winning Arabic STT + TTS combo;
  the explicit acceptance gate is the evaluator judging Arabic voice quality acceptable for a
  real interview (or recording a clear no-go with reasons).

## Assumptions

- The acceptance of "Arabic voice quality" is a deliberate **human judgement** by the
  evaluator, not an automated metric; this is inherent to a de-risking spike.
- Deepgram is the starting candidate for Arabic speech-to-text per the roadmap; other
  providers may be substituted during evaluation if it underperforms, and the outcome is
  recorded either way.
- Comparing Arabic TTS across ElevenLabs and Azure (at least one voice each) is sufficient
  for a meaningful comparison; an exhaustive survey of every available voice/provider is not
  required.
- The conversational AI behind the call uses a simple, generic interviewer prompt — building
  the dynamic, config-driven interviewer prompt is Phase 4 and out of scope here.
- The evaluator runs the spike locally and/or on the existing Vercel deployment with a
  working microphone and the necessary provider accounts/keys configured server-side.
- The spike page and any helper code are throwaway and will be removed or replaced when the
  real interview room (Phase 4) is built; minimal polish is expected.
- "Acceptable" quality is interpreted as a reasonable evaluator-driven threshold rather than
  a fixed numeric target, judged specifically against spoken Egyptian Arabic.

## Dependencies

- Phase 0 foundation (deployable Next.js skeleton, env management) is complete and is the
  base this spike runs on.
- Active accounts/keys for the live-voice provider (Vapi), the Arabic STT provider
  (Deepgram), and the candidate Arabic TTS providers (ElevenLabs and Azure), configured as
  server-side secrets.
- A microphone-capable device and browser for the evaluator.
