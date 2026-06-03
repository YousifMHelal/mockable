export type Language = "en" | "ar";

export type VoiceProvider = "11labs";

export type ElevenLabsModel =
  | "eleven_monolingual_v1"
  | "eleven_multilingual_v2"
  | "eleven_turbo_v2_5";

export type VoiceOption = {
  id: string;
  label: string;
  language: Language;
  provider: VoiceProvider;
  voiceId: string;
  model: ElevenLabsModel;
};

export const voiceOptions: VoiceOption[] = [
  {
    id: "en-elevenlabs-adam",
    label: "English - ElevenLabs (Adam)",
    language: "en",
    provider: "11labs",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    model: "eleven_monolingual_v1",
  },
  {
    id: "en-elevenlabs-bella",
    label: "English - ElevenLabs (Bella)",
    language: "en",
    provider: "11labs",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    model: "eleven_multilingual_v2",
  },
  {
    id: "ar-elevenlabs-multilingual-a",
    label: "Arabic - ElevenLabs (Multilingual A)",
    language: "ar",
    provider: "11labs",
    voiceId: "pNInz6obpgDQGcFmaJgB",
    model: "eleven_multilingual_v2",
  },
  {
    id: "ar-elevenlabs-multilingual-b",
    label: "Arabic - ElevenLabs (Multilingual B)",
    language: "ar",
    provider: "11labs",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    model: "eleven_multilingual_v2",
  },
];

export const getVoicesByLanguage = (language: Language): VoiceOption[] =>
  voiceOptions.filter((voice) => voice.language === language);

export const getDefaultVoice = (language: Language): VoiceOption | null =>
  getVoicesByLanguage(language)[0] ?? null;
