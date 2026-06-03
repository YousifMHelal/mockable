# Phase 1 Data Model: Vapi + Arabic Spike

> **No persistence.** This spike writes nothing to the database — no `Interview`/`Result`
> rows, no migration (FR-012). The "data model" below is the set of **ephemeral, in-memory
> TypeScript shapes** the `/spike` page holds in React state and discards on unload. They are
> documented so the implementation is typed (Principle IV) and consistent.

## Ephemeral types

### `Language`

The selectable spoken language for a run.

```text
type Language = "en" | "ar"
```

- `"en"` → English run (Deepgram `en`, English voice).
- `"ar"` → Egyptian-Arabic run (Deepgram `ar`, Arabic voice, RTL transcript).

### `VoiceOption`

A selectable transcriber-aware voice in the candidate catalog (`lib/spike/voices.ts`).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Stable key for the `<select>` and for the findings doc. |
| `label` | `string` | Human label shown in the UI (English, per Principle VI). |
| `language` | `Language` | Which language this voice belongs to. |
| `provider` | `"elevenlabs" \| "azure" \| <en-provider>` | TTS provider. |
| `voiceId` | `string` | Provider voice id (e.g. `ar-EG-SalmaNeural`, an ElevenLabs voice id). |

- **Validation**: the catalog MUST contain ≥1 English voice, ≥1 Arabic **ElevenLabs** voice,
  and ≥1 Arabic **Azure** voice (SC-005). Egyptian Azure voices use `ar-EG-*` ids.

### `AssistantConfig` (transient Vapi assistant)

Built by `lib/spike/assistant.ts` from `(language, voiceOption)` and passed to
`vapi.start(...)`. Shape mirrors the Vapi transient-assistant schema (subset used here):

| Field | Type | Notes |
|-------|------|-------|
| `model` | `{ provider, model, messages: [systemPrompt] }` | Fast LLM + generic interviewer prompt; prompt instructs Egyptian Arabic when `language === "ar"`. |
| `transcriber` | `{ provider: "deepgram", language: "en" \| "ar", model }` | STT per Decision 3. |
| `voice` | `{ provider, voiceId, model? }` | From the selected `VoiceOption` (Decision 4). |
| `firstMessage` | `string` | Optional greeting in the run's language. |

- **No API keys** appear in this object — providers are referenced by name only; keys are
  resolved by Vapi from its dashboard (Principle II, Decision 2).

### `TranscriptEntry`

One line in the live transcript panel, derived from Vapi `transcript` messages.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Local key (e.g. incrementing or role+timestamp). |
| `role` | `"user" \| "assistant"` | Who spoke. |
| `text` | `string` | The utterance text. |
| `isFinal` | `boolean` | `false` while a partial is streaming; replaced/committed on final. |

- **Behavior**: a partial for a role replaces that role's in-progress line; a final commits
  it (Decision 6). Arabic entries render in the RTL/Cairo block; English entries LTR.

### `CallState`

The page's top-level status, driving controls and messaging.

```text
type CallState =
  | "idle"        // no call; start enabled
  | "connecting"  // start pressed, awaiting call-start
  | "active"      // call-start received; speaking/listening
  | "ending"      // stop pressed, awaiting call-end
  | "error"       // mic denied / connection failed / dropped — shows reason, retryable
```

- **Transitions**: `idle → connecting → active → ending → idle`; any state `→ error` on the
  Vapi `error` event or a rejected mic-permission promise; `error → idle` on retry (FR-010).

### `volumeLevel`

A single `number` in `[0, 1]` from the Vapi `volume-level` event, driving the meter; resets
toward `0` on silence (US3).

## Relationships

```text
Language ──selects──▶ VoiceOption ──feeds──▶ AssistantConfig ──vapi.start()──▶ live call
                                                                   │
                                              call emits ──────────┤
                                                                   ├─▶ TranscriptEntry[]  (transcript messages)
                                                                   ├─▶ volumeLevel         (volume-level events)
                                                                   └─▶ CallState           (call-start/-end/error)
```

Nothing in this diagram is written to Postgres; the entire graph lives in component state for
the duration of a single evaluation and is the disposable surface deleted in Phase 4.
