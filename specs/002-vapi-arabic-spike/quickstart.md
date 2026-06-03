# Quickstart: Vapi + Arabic Spike

How to stand up and run the throwaway `/spike` evaluation page, then record the verdict.

## Prerequisites

- Phase 0 skeleton runs locally (`npm install`, `.env` filled, `npm run dev` works).
- A **microphone** and a Chromium-based browser (best WebRTC support).
- A **Vapi account** with provider keys configured in the dashboard.

## 1. Configure provider keys in the Vapi dashboard (one-time)

All secrets live in Vapi, **not** in the app (Principle II). In
[dashboard.vapi.ai](https://dashboard.vapi.ai/) → Provider Keys, add:

- **Deepgram** API key (Arabic + English STT)
- **ElevenLabs** API key (Arabic TTS — multilingual)
- **Azure Speech** key + region (Arabic TTS — Egyptian `ar-EG-*` voices)
- An **LLM** key (OpenAI or Anthropic) for the conversational model

Copy your Vapi **public** key into the app env (already named in `.env.example`):

```bash
# .env
NEXT_PUBLIC_VAPI_PUBLIC_KEY="pk_..."   # public key ONLY — never a private/provider key
```

## 2. Install the Vapi browser SDK

```bash
npm install @vapi-ai/web
```

## 3. Run

```bash
npm run dev
# open http://localhost:3000/spike
```

## 4. Evaluate (the actual de-risk)

**English smoke test (US1 / SC-001):**
1. Leave language = English, press **Start**.
2. Grant mic permission; you should hear a greeting within a few seconds.
3. Hold ≥3 back-and-forth turns; confirm the transcript streams both sides live.
4. Watch the volume meter react while the AI speaks; press **Stop** — page returns to idle.

**Egyptian-Arabic test (US2 / SC-002, SC-004, SC-005):**
1. Switch language = Arabic, voice = **Azure (ar-EG)**, press Start; speak Egyptian Arabic.
2. Confirm: the AI understands you (check the recognized text), replies in intelligible
   Egyptian Arabic, and the transcript renders **right-to-left in Arabic (Cairo) script**
   while the rest of the page stays English/LTR.
3. Stop, switch voice = **ElevenLabs (Arabic)**, repeat — compare naturalness/dialect.

**Failure paths (FR-010):** deny mic permission once, and/or kill the network mid-call —
confirm you get a clear error state and can retry, not a silent hang.

## 5. Record the verdict (US4 / SC-007)

Write the conclusion in [findings.md](./findings.md):

- Winning **STT** (Deepgram acceptable for Egyptian Arabic? yes/no) and **TTS** provider/voice.
- A clear **go / no-go** on Egyptian-Arabic voice quality, with brief reasoning.
- If no-go: what was wrong (recognition errors, dialect mismatch, robotic voice) and what to
  trial next. This is the cheapest moment to change course.

## Acceptance gate

The phase is **done when** you have held a real spoken exchange in both English and Egyptian
Arabic and recorded a clear quality verdict in `findings.md`. Type-clean gate: `npx tsc
--noEmit` and `npm run build` pass.

## Teardown (later)

Everything is disposable: `app/spike/`, `lib/spike/`, and the `@vapi-ai/web` dep can be
removed when Phase 4 builds the real interview room. `findings.md` stays as the durable record.
