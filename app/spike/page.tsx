"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { voiceOptions, type VoiceOption } from "@/lib/spike/voices";

type CallState = "idle" | "connecting" | "active" | "ending" | "error";

type TranscriptEntry = {
  id: string;
  role: "user" | "assistant";
  text: string;
  isFinal: boolean;
};

type TranscriptMessage = {
  type: "transcript";
  role: "user" | "assistant";
  transcript: string;
  transcriptType: "partial" | "final";
};

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "";
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ?? "";

const ENGLISH_VOICES = voiceOptions.filter((v) => v.language === "en");

const STATUS_LABELS: Record<CallState, string> = {
  idle: "Idle",
  connecting: "Connecting",
  active: "Live",
  ending: "Ending",
  error: "Error",
};

const STATUS_CLASSES: Record<CallState, string> = {
  idle: "bg-[#eae8e4] text-[#494454]",
  connecting: "bg-[#e9ddff] text-[#5516be]",
  active: "bg-[#d0bcff] text-[#23005c]",
  ending: "bg-[#ffdadb] text-[#92002a]",
  error: "bg-[#ffdad6] text-[#93000a]",
};

const isTranscriptMessage = (value: unknown): value is TranscriptMessage => {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    r.type === "transcript" &&
    (r.role === "user" || r.role === "assistant") &&
    typeof r.transcript === "string" &&
    (r.transcriptType === "partial" || r.transcriptType === "final")
  );
};

const clampVolume = (v: number) => Math.max(0, Math.min(1, v));

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Something went wrong. Please try again.";
};

export default function SpikePage() {
  const vapiRef = useRef<InstanceType<typeof Vapi> | null>(null);
  const transcriptCounter = useRef(0);

  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    ENGLISH_VOICES[0]?.id ?? ""
  );
  const [callState, setCallState] = useState<CallState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const selectedVoice: VoiceOption | null =
    ENGLISH_VOICES.find((v) => v.id === selectedVoiceId) ??
    ENGLISH_VOICES[0] ??
    null;

  useEffect(() => {
    if (!PUBLIC_KEY) return;

    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;

    const handleCallStart = () => setCallState("active");

    const handleCallEnd = () => {
      setCallState("idle");
      setErrorMessage(null);
      setVolumeLevel(0);
    };

    const handleMessage = (payload: unknown) => {
      if (!isTranscriptMessage(payload)) return;
      setTranscript((prev) => {
        const next = [...prev];
        const inProgressIndex = next.findIndex(
          (e) => e.role === payload.role && !e.isFinal
        );
        const id =
          inProgressIndex >= 0
            ? next[inProgressIndex].id
            : `line-${transcriptCounter.current++}`;
        const updated: TranscriptEntry = {
          id,
          role: payload.role,
          text: payload.transcript,
          isFinal: payload.transcriptType === "final",
        };
        if (inProgressIndex >= 0) next[inProgressIndex] = updated;
        else next.push(updated);
        return next;
      });
    };

    const handleVolume = (payload: unknown) => {
      if (typeof payload === "number") setVolumeLevel(clampVolume(payload));
    };

    const handleError = (payload: unknown) => {
      setErrorMessage(getErrorMessage(payload));
      setCallState("error");
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("volume-level", handleVolume);
    vapi.on("error", handleError);

    return () => {
      vapi.off?.("call-start", handleCallStart);
      vapi.off?.("call-end", handleCallEnd);
      vapi.off?.("message", handleMessage);
      vapi.off?.("volume-level", handleVolume);
      vapi.off?.("error", handleError);
      vapiRef.current = null;
    };
  }, []);

  useEffect(() => {
    const decay = window.setInterval(() => {
      setVolumeLevel((v) => clampVolume(v - 0.04));
    }, 120);
    return () => window.clearInterval(decay);
  }, []);

  const canStart =
    (callState === "idle" || callState === "error") &&
    Boolean(PUBLIC_KEY) &&
    Boolean(ASSISTANT_ID) &&
    Boolean(selectedVoice);
  const canStop = callState === "connecting" || callState === "active";
  const volumePercent = Math.round(volumeLevel * 100);

  const handleStart = async () => {
    if (!PUBLIC_KEY || !ASSISTANT_ID) {
      setErrorMessage(
        "Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY or NEXT_PUBLIC_VAPI_ASSISTANT_ID."
      );
      setCallState("error");
      return;
    }
    if (!selectedVoice) {
      setErrorMessage("Select a voice before starting a call.");
      setCallState("error");
      return;
    }
    if (!vapiRef.current) {
      setErrorMessage("Vapi client is not ready yet. Please retry.");
      setCallState("error");
      return;
    }

    setErrorMessage(null);
    setCallState("connecting");
    setTranscript([]);
    setVolumeLevel(0);
    transcriptCounter.current = 0;

    try {
      await vapiRef.current.start(ASSISTANT_ID, {
        firstMessage: "Hi! Ready to start a short mock interview?",
        transcriber: { provider: "deepgram", language: "en", model: "nova-2" },
        voice: {
          provider: "11labs",
          voiceId: selectedVoice.voiceId,
          model: selectedVoice.model,
        },
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setCallState("error");
    }
  };

  const handleStop = () => {
    if (!vapiRef.current) return;
    setCallState("ending");
    try {
      vapiRef.current.stop();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setCallState("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#fcf9f5] px-6 py-12 text-[#1c1c1a]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#494454]">
            Phase 1 Spike
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Vapi live voice evaluator
          </h1>
          <p className="max-w-2xl text-base text-[#494454]">
            Run a live English voice exchange with a live streaming transcript.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col gap-6 rounded-[24px] border border-[#efecea] bg-white p-8 shadow-[0_24px_60px_rgba(109,59,215,0.12)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[callState]}`}
                >
                  {STATUS_LABELS[callState]}
                </span>
                <span className="text-sm text-[#494454]" aria-live="polite">
                  {callState === "active"
                    ? "Call in progress"
                    : callState === "connecting"
                      ? "Connecting to Vapi"
                      : callState === "ending"
                        ? "Ending call"
                        : callState === "error"
                          ? "Call failed"
                          : "Ready when you are"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#494454]">
                <span className="font-medium">Volume</span>
                <span>{volumePercent}%</span>
              </div>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-[#f0ede9]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6b38d4] to-[#b90538] transition-[width] duration-150"
                style={{ width: `${volumePercent}%` }}
              />
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-[#494454]">
              Voice
              <select
                className="h-12 rounded-full border border-[#dcdad6] bg-white px-4 text-base text-[#1c1c1a] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b38d4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf9f5]"
                value={selectedVoiceId}
                onChange={(e) => setSelectedVoiceId(e.target.value)}
              >
                {ENGLISH_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>

            {errorMessage ? (
              <div className="rounded-2xl border border-[#ffdad6] bg-[#ffefec] p-4 text-sm text-[#93000a]">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="h-12 rounded-full bg-gradient-to-r from-[#6b38d4] to-[#b90538] px-6 text-base font-semibold text-white shadow-[0_12px_30px_rgba(109,59,215,0.25)] transition enabled:hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b38d4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf9f5] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleStart}
                disabled={!canStart}
              >
                Start call
              </button>
              <button
                type="button"
                className="h-12 rounded-full border border-[#1c1c1a] px-6 text-base font-semibold text-[#1c1c1a] transition enabled:hover:-translate-y-[1px] enabled:hover:shadow-[0_10px_22px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1c1a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcf9f5] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleStop}
                disabled={!canStop}
              >
                Stop call
              </button>
            </div>

            {!PUBLIC_KEY || !ASSISTANT_ID ? (
              <p className="text-sm text-[#93000a]">
                Add NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID
                to your .env before starting a call.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-4 rounded-[24px] border border-[#efecea] bg-white p-8 shadow-[0_24px_60px_rgba(109,59,215,0.12)]">
            <h2 className="text-lg font-semibold">Live transcript</h2>

            <div className="flex max-h-105 flex-1 flex-col gap-4 overflow-y-auto pr-2 text-sm">
              {transcript.length === 0 ? (
                <div className="rounded-2xl border border-[#efecea] bg-[#f6f3ef] p-4 text-[#494454]">
                  Transcript lines will appear here once the call starts.
                </div>
              ) : (
                transcript.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-2xl border border-[#efecea] p-4 ${
                      entry.role === "assistant" ? "bg-white" : "bg-[#f6f3ef]"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#494454]">
                      {entry.role === "assistant" ? "Assistant" : "You"}
                      {!entry.isFinal ? " (live)" : ""}
                    </p>
                    <p className="mt-2 text-base text-[#1c1c1a]">{entry.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
