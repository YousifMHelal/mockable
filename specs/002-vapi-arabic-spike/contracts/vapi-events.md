# Contract: Vapi SDK Event & Config Interface

The spike exposes **no external API/CLI** of its own — the only UI surface is the throwaway
`/spike` page. The meaningful contract this phase depends on is the **`@vapi-ai/web` SDK
interface**: the config the page sends *in* and the events it consumes *out*. Documenting it
here pins the integration the implementation must satisfy (and the same surface Phase 4 will
build on).

## Outbound: starting a call

```text
const vapi = new Vapi(NEXT_PUBLIC_VAPI_PUBLIC_KEY)   // public key only (Principle II)
vapi.start(assistantConfig)                          // transient AssistantConfig (see data-model.md)
vapi.stop()                                          // ends the active call
```

- `assistantConfig` references providers **by name** (`deepgram`, `elevenlabs`/`azure`, the
  LLM) — **never** an API key. Keys are resolved by Vapi from its dashboard.
- The public key is the **only** credential the browser holds.

## Inbound: events consumed (the contract the page binds to)

| Event | Payload (subset used) | Page reaction |
|-------|-----------------------|---------------|
| `call-start` | — | `CallState: connecting → active` |
| `call-end` | — | `CallState → idle`; freeze final transcript |
| `speech-start` / `speech-end` | — | Optional: indicate who is speaking |
| `message` (`type: "transcript"`) | `{ role, transcript, transcriptType: "partial" \| "final" }` | Upsert a `TranscriptEntry` (partial replaces, final commits) — FR-003 |
| `volume-level` | `number` in `[0,1]` | Drive the volume meter — FR-008 |
| `error` | `{ ... }` / `Error` | `CallState → error` with a clear message — FR-010 |

- **Type safety (Principle IV)**: each handler types its payload explicitly; any unavoidable
  `any` at the SDK boundary carries a one-line justification comment.

## Contract acceptance checks

These are the observable guarantees the implementation must meet (traceable to the spec):

1. Starting a call with only the public key connects and yields an audible greeting (FR-002,
   FR-009, SC-001).
2. `message`/transcript events render both roles live, within ~2s of speech (FR-003, SC-003).
3. For an Arabic run, transcript text renders RTL in Cairo while the page stays LTR (FR-007,
   SC-004).
4. `volume-level` events visibly drive the meter during AI speech and settle on silence
   (FR-008, SC-006).
5. A denied mic / failed connection / mid-call drop yields a clear `error` state that is
   retryable, not a silent hang (FR-010).

## Not in this contract

- No HTTP route or server action is required (provider keys live in the Vapi dashboard,
  Decision 2). If Phase 4 introduces a server-built assistant, that route's contract will be
  defined there — out of scope for the spike.
- No database/persistence contract — nothing is written (FR-012).
- No scoring/evaluation contract — that is a separate post-call LLM concern (Principle III,
  NFR-002), out of scope here.
