"use client";

import { useState } from "react";
import { useImproveText } from "@/hooks/mutations/useImproveText";

// ─── Types (mirror WritingResponse from route) ────────────────────────────────
type SuggestionType =
  | "structure"
  | "clarity"
  | "tone"
  | "word_choice"
  | "conciseness";

const SUGGESTION_STYLE: Record<
  SuggestionType,
  { label: string; color: string; bg: string }
> = {
  structure: {
    label: "Structure",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  clarity: {
    label: "Clarity",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  tone: {
    label: "Tone",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  word_choice: {
    label: "Word choice",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  conciseness: {
    label: "Conciseness",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
};

const READABILITY_STYLE = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  advanced: {
    label: "Advanced",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
};

// ─── Preset chips ─────────────────────────────────────────────────────────────
const PRESETS = [
  {
    label: "More concise",
    value: "Make it more concise and remove filler words",
  },
  { label: "Fix grammar", value: "Fix grammar and spelling errors" },
  { label: "More formal", value: "Make the tone more professional and formal" },
  { label: "More casual", value: "Make this more casual and conversational" },
  { label: "Improve clarity", value: "Improve clarity and sentence structure" },
  { label: "More persuasive", value: "Make it more persuasive and compelling" },
  {
    label: "Simplify language",
    value: "Simplify the language for a general audience",
  },
  {
    label: "Expand & add detail",
    value: "Add more detail and expand on the key ideas",
  },
];

function countWords(str: string) {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

// ─── Small reusable pieces ────────────────────────────────────────────────────
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WritingPage() {
  const [instruction, setInstruction] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);

  const { mutate, data, isPending, isError, reset } = useImproveText();

  // ── Chip handling ──────────────────────────────────────────────────────────
  function handleChipClick(preset: { label: string; value: string }) {
    if (activeChip === preset.label) {
      setActiveChip(null);
      setInstruction("");
    } else {
      setActiveChip(preset.label);
      setInstruction(preset.value);
    }
  }

  function handleInstructionChange(val: string) {
    setInstruction(val);
    const match = PRESETS.find((s) => s.value === val);
    setActiveChip(match ? match.label : null);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleImprove() {
    if (!inputText.trim()) return;
    reset();
    mutate({ text: inputText, instruction: instruction || undefined });
  }

  // ── Copy ──────────────────────────────────────────────────────────────────
  async function handleCopy() {
    if (!data?.improvedText) return;
    await navigator.clipboard.writeText(data.improvedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasResult = !!data;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0f0f0f] text-white overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-medium text-white">Writing Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste your text, pick an edit style, and get an improved version
            instantly.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            How would you like your text edited?
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleChipClick(s)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                  activeChip === s.label
                    ? "bg-violet-900/60 border-violet-500 text-violet-200"
                    : "bg-transparent border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom instruction */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Custom instruction
          </span>
          <textarea
            value={instruction}
            onChange={(e) => handleInstructionChange(e.target.value)}
            placeholder="Describe how you'd like your text edited, or pick a suggestion above…"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 resize-none outline-none focus:border-white/25 transition-colors"
          />
        </div>

        <div className="h-px bg-white/5" />

        {/* ── Side-by-side editors ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Input panel */}
          <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-white/[0.03]">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
              <span className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-400">
                Your text
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your writing here…"
              className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-200 placeholder-gray-700 resize-none outline-none leading-relaxed min-h-[240px]"
            />
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
              <span className="text-xs text-gray-600">
                {countWords(inputText)} words
              </span>
              <button
                onClick={handleImprove}
                disabled={isPending || !inputText.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-violet-700 hover:bg-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? (
                  <>
                    <Spinner className="w-3.5 h-3.5" /> Improving…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 3l14 9-14 9V3z"
                      />
                    </svg>
                    Improve text
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output panel */}
          <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-white/[0.03]">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-400">
                Improved text
              </span>
            </div>
            <div className="flex-1 px-4 py-3 min-h-[240px] overflow-y-auto">
              {isPending ? (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Spinner className="w-4 h-4 text-violet-500" />
                  Improving your text…
                </div>
              ) : isError ? (
                <p className="text-sm text-red-400">
                  Something went wrong. Please try again.
                </p>
              ) : data?.improvedText ? (
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {data.improvedText}
                </p>
              ) : (
                <p className="text-sm text-gray-700 italic">
                  Improved text will appear here…
                </p>
              )}
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
              <span className="text-xs text-gray-600">
                {countWords(data?.improvedText ?? "")} words
              </span>
              {data?.improvedText && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors"
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Analysis block (only shown when there's a result) ── */}
        {hasResult && data && (
          <div className="flex flex-col gap-4 border border-white/10 rounded-xl p-5 bg-white/[0.02]">
            {/* Stats row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-1">
                Analysis
              </span>

              {/* Word count delta */}
              <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-gray-400">
                {data.stats.originalWordCount} → {data.stats.improvedWordCount}{" "}
                words
                {data.stats.improvedWordCount <
                  data.stats.originalWordCount && (
                  <span className="text-emerald-400 ml-1">
                    −
                    {data.stats.originalWordCount -
                      data.stats.improvedWordCount}
                  </span>
                )}
                {data.stats.improvedWordCount >
                  data.stats.originalWordCount && (
                  <span className="text-amber-400 ml-1">
                    +
                    {data.stats.improvedWordCount -
                      data.stats.originalWordCount}
                  </span>
                )}
              </span>

              {/* Readability badge */}
              <span
                className={`text-xs px-2.5 py-1 rounded-full border ${READABILITY_STYLE[data.stats.readabilityScore].bg} ${READABILITY_STYLE[data.stats.readabilityScore].color}`}
              >
                {READABILITY_STYLE[data.stats.readabilityScore].label}{" "}
                readability
              </span>
            </div>

            <div className="h-px bg-white/5" />

            {/* Two-column: suggestions + mistakes */}
            <div className="grid grid-cols-2 gap-5">
              {/* Suggestions */}
              {data.suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggestions
                  </span>
                  <div className="flex flex-col gap-2">
                    {data.suggestions.map((s, i) => {
                      const style = SUGGESTION_STYLE[s.type];
                      return (
                        <div
                          key={i}
                          className={`flex gap-2.5 items-start rounded-lg border px-3 py-2.5 ${style.bg}`}
                        >
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 flex-shrink-0 ${style.color}`}
                          >
                            {style.label}
                          </span>
                          <p className="text-xs text-gray-300 leading-relaxed">
                            {s.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mistakes */}
              {data.mistakes.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Corrections
                  </span>
                  <div className="flex flex-col gap-2">
                    {data.mistakes.map((m, i) => (
                      <div
                        key={i}
                        className="flex flex-col gap-1 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span className="line-through text-gray-500">
                            {m.original}
                          </span>
                          <svg
                            className="w-3 h-3 text-gray-600 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <span className="text-emerald-400 font-medium">
                            {m.corrected}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {m.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback if both empty */}
              {data.suggestions.length === 0 && data.mistakes.length === 0 && (
                <p className="text-sm text-gray-600 italic col-span-2">
                  No specific issues found — your text looks great!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
