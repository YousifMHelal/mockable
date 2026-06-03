# Phase 1 Research: Vapi + Arabic Spike

The stack is fixed by the constitution (Vapi for live voice, an LLM for later scoring), and
the spec's clarification session locked the Arabic variety (**Egyptian**) and the TTS
comparison set (**ElevenLabs + Azure**). Research here resolves *how* to wire Vapi in a
Next.js browser, *where* provider keys live (the Principle II question), and the concrete
provider/voice/model configuration to evaluate. No `NEEDS CLARIFICATION` items remain.

## Decision 1 — Vapi integration: browser Web SDK with a transient assistant

- **Decision**: Use `@vapi-ai/web` in a Client Component. Instantiate `new Vapi(publicKey)`
  once, and start each call with `vapi.start(assistantConfig)` passing a **transient
  assistant object** built per language/voice selection (not a pre-created dashboard assistant
  ID). Stop with `vapi.stop()`.
- **Rationale**: A transient assistant lets the spike vary the transcriber/voice/prompt
  per run from code, which is exactly what an evaluation needs (compare ElevenLabs vs Azure in
  one session). The Web SDK manages the WebRTC mic/audio and emits the events we need.
- **Alternatives considered**: Pre-created dashboard assistants selected by ID (rejected —
  forces dashboard round-trips to tweak voices, slower iteration for a spike); building the
  assistant server-side via a route handler with `VAPI_PRIVATE_KEY` (deferred — that is the
  Phase 4 productionization pattern; unnecessary plumbing for a throwaway page since no secret
  is required client-side, see Decision 2).

## Decision 2 — Where provider keys live (Principle II)

- **Decision**: Store the **Deepgram, ElevenLabs, Azure, and LLM API keys in the Vapi
  dashboard** ("Provider Keys"). The browser receives only `NEXT_PUBLIC_VAPI_PUBLIC_KEY`. The
  transient assistant config references providers by name/model/voice-id; Vapi injects the
  real keys server-side when it places the call.
- **Rationale**: This keeps **zero secrets in the client bundle** — the hard line of
  Principle II — without writing any server route for the spike. The provider API keys never
  touch our app's env or browser.
- **Alternatives considered**: Putting provider keys in app `.env` and creating the assistant
  through a Next.js server action that forwards them to Vapi (valid and Principle-II-compliant,
  but extra code for no spike benefit; revisit in Phase 4 if we need server-built prompts).
  Putting any provider key in `NEXT_PUBLIC_*` (rejected outright — violates Principle II).

## Decision 3 — Arabic STT: Deepgram

- **Decision**: Transcriber = Deepgram with `language: "multi"` (multilingual model) for Arabic
  runs, as Deepgram nova-2 does not support explicit `ar` language code. English runs use
  `language: "en"` with nova-2.
- **Rationale**: Deepgram is the roadmap's named STT candidate and is a first-class Vapi
  transcriber. The `multi` model supports Arabic. Streaming partial/final results feed the live
  transcript within the ~2s target (SC-003).
- **Risk to evaluate**: Deepgram's `multi` model for Egyptian colloquial recognition accuracy
  is the unknown this spike measures. If Egyptian recognition is poor, that is a recorded
  finding (and a candidate reason to trial an alternative STT).
- **Alternatives considered**: Other STT providers (held in reserve — only trialed if Deepgram
  `multi` Arabic underperforms; outcome recorded either way). Note: Deepgram nova-2 has no
  native Arabic support, necessitating the multilingual fallback.

## Decision 4 — Arabic TTS: ElevenLabs vs Azure (head-to-head)

- **Decision**: Evaluate at least one Arabic voice from **each** provider in a single session:
  - **Azure**: Egyptian neural voices `ar-EG-SalmaNeural` (female) and/or `ar-EG-ShakirNeural`
    (male) — Azure ships *explicitly Egyptian* dialect voices, the strongest fit for the
    locked target.
  - **ElevenLabs**: a multilingual-model voice (eleven_multilingual_v2) capable of Arabic —
    stronger naturalness/expressiveness, dialect controlled via the spoken text rather than a
    dedicated Egyptian voice id.
- **Rationale**: This is the core comparison the spike exists to make. Azure offers native
  Egyptian dialect coverage; ElevenLabs offers naturalness. Judging them side by side on
  Egyptian Arabic is the go/no-go decision (SC-005, SC-007).
- **Alternatives considered**: ElevenLabs-only or Azure-only (rejected in clarification — a
  head-to-head is the point); OpenAI TTS (rejected in clarification — weaker Arabic dialect
  control).

## Decision 5 — Conversational LLM + dynamic spoken-language prompt

- **Decision**: Use a fast, cheap chat model (GPT-4o-mini or Claude Haiku) as the assistant's
  `model`, with a **generic interviewer** system prompt. Inject a spoken-language instruction
  per selection: English runs instruct English; Arabic runs instruct the model to speak
  **Egyptian Arabic (Masri)**.
- **Rationale**: The spike only needs a plausible interlocutor to exercise the voice path; the
  *dynamic, config-driven* interviewer prompt (type/field/difficulty) is explicitly Phase 4.
  Steering dialect via the prompt complements Azure's Egyptian voice and is the only lever for
  ElevenLabs' dialect.
- **Alternatives considered**: A fully scripted/no-LLM bot (rejected — can't sustain a natural
  spoken exchange); the production dynamic prompt (out of scope — Phase 4).

## Decision 6 — Live transcript model & Arabic RTL rendering

- **Decision**: Consume Vapi `message` events where `type === "transcript"`, keyed by `role`
  (user/assistant) and `transcriptType` (partial → replace the in-progress line; final →
  commit it). Render a running list. For Arabic runs, wrap the transcript block in `dir="rtl"`
  with the **Cairo** font loaded via `next/font/google`, scoped to that block only; the rest
  of the page stays English/LTR.
- **Rationale**: Satisfies FR-003 (live streaming) and FR-007 + Principle VI (Arabic font +
  RTL on that block alone). Partial-vs-final handling keeps the transcript readable rather
  than flickering duplicate fragments.
- **Alternatives considered**: Rendering only final transcripts (rejected — loses the "live"
  feel and the ~2s responsiveness signal); applying RTL to the whole page (rejected — violates
  Principle VI).

## Decision 7 — Volume-level events → simple meter (orb stand-in)

- **Decision**: Subscribe to `vapi.on("volume-level", (v: number) => …)` (0..1) and render a
  lightweight CSS meter/bar that reacts in real time; settle to zero on silence.
- **Rationale**: Proves the data feed the Phase 4 GSAP orb will consume (US3/FR-008/SC-006)
  without building the orb. No GSAP needed, so no `prefers-reduced-motion` concern here.
- **Alternatives considered**: Building the real animated orb now (rejected — premature; the
  spike only needs to confirm the events fire and are usable).

## Decision 8 — Failure handling & the findings deliverable

- **Decision**: Handle mic-permission denial, connection failure, and mid-call drops via the
  Vapi `error` event and the WebRTC permission promise, surfacing a clear status string and
  returning the page to an idle, retryable state (FR-010). Capture the conclusion in
  `specs/002-vapi-arabic-spike/findings.md` — winning STT + TTS combo, Egyptian-Arabic quality
  verdict, and reasoning (US4/FR-011/SC-007).
- **Rationale**: A spike must make failure *visible* (including a poor-Arabic no-go), not hide
  it. The findings doc is the durable output that feeds Phase 4.
- **Alternatives considered**: Silent failure / console-only errors (rejected — the evaluator
  must see why a call didn't start); recording findings only in chat (rejected — not durable).
