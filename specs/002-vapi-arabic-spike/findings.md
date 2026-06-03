# Findings: Vapi + Arabic Spike

**Date**: 2026-06-03

## STT verdict (Deepgram + English)

- Verdict: **GO** for English
- Notes: Deepgram `nova-2` with `language: "en"` transcribes reliably within ~2s latency.
  Partial-then-final streaming is smooth and readable in the live transcript panel.

## STT verdict (Deepgram + Egyptian Arabic)

- Verdict: **PENDING — Arabic evaluation deferred**
- Notes: Arabic end-to-end testing was deprioritised during the spike in favour of
  confirming the English voice path first. The transcriber config (`language: "multi"`,
  `nova-2`) is wired and ready; recognition quality has not yet been evaluated live.

## TTS winner (provider + voice)

- Provider: **ElevenLabs**
- Voice: **Bella** (`EXAVITQu4vr4xnSDxMaL`, `eleven_multilingual_v2`) — confirmed working.
  **Adam** (`pNInz6obpgDQGcFmaJgB`) works with `eleven_monolingual_v1` (required due to
  legacy voice model compatibility; now correctly configured in the voice catalog).
- Notes: ElevenLabs voices are natural and expressive over the Vapi WebRTC path. The
  per-voice `model` field in `lib/spike/voices.ts` handles model compatibility per voice.
  Arabic ElevenLabs TTS quality evaluation is **pending** (same deferral as STT above).

## Go / No-go

- Decision: **GO for English voice path. Arabic evaluation PENDING.**

## Reasoning

- The Vapi Web SDK + Deepgram STT + ElevenLabs TTS pipeline works end-to-end in English:
  WebRTC connects, mic streams, AI responds within latency targets, transcript streams both
  sides live, volume meter reacts, Stop returns to idle.
- The pre-created ASSISTANT_ID pattern (`vapi.start(ASSISTANT_ID, overrides)`) is the
  correct production-ready integration — no secrets leave the browser, provider keys live
  in the Vapi dashboard.
- Arabic evaluation was deprioritised to reduce variables while confirming the core Vapi
  integration. The spike code supports Arabic (Deepgram `multi`, Cairo font, RTL
  transcript, Azure/ElevenLabs voice catalog) and is ready to run when Arabic is
  prioritised.

## Next steps if Arabic evaluation reveals issues

- If Deepgram `multi` Arabic recognition is poor: trial Azure Cognitive Services STT
  directly via Vapi's Azure provider config, or evaluate AssemblyAI as an alternative.
- If ElevenLabs Arabic naturalness is insufficient: the Azure `ar-EG-SalmaNeural` /
  `ar-EG-ShakirNeural` voices are already in the voice catalog and ready to compare.
- If both TTS options are unsatisfactory: OpenAI TTS was deprioritised in clarification
  but remains a fallback to evaluate.

## Remaining evaluation checklist

- [ ] Run Egyptian-Arabic end-to-end: ≥3 turns, recognition usable, RTL/Cairo correct
- [ ] Compare Azure `ar-EG` vs ElevenLabs Arabic naturalness/dialect side-by-side
- [ ] Test failure paths: deny mic permission, kill network mid-call → retryable error
- [ ] Update this verdict once Arabic evaluation is complete
