"use client";

import { useState, useRef, useCallback } from "react";
import { useGenerateQuiz } from "@/hooks/mutations/useGenerateQuiz";
import type { Question } from "@/app/api/quiz/route";

// ── Types ──────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";
type QuestionCount = 5 | 10 | 15;

interface AnswerState {
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: number; // ms timestamp
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DifficultyChip({
  value,
  selected,
  onClick,
}: {
  value: Difficulty;
  selected: boolean;
  onClick: () => void;
}) {
  const colors: Record<Difficulty, string> = {
    easy: selected
      ? "bg-emerald-800 text-white border-emerald-800"
      : "border-zinc-700 text-zinc-300 hover:border-emerald-700 hover:text-emerald-300",
    medium: selected
      ? "bg-amber-800 text-white border-amber-800"
      : "border-zinc-700 text-zinc-300 hover:border-amber-700 hover:text-amber-300",
    hard: selected
      ? "bg-rose-800 text-white border-rose-800"
      : "border-zinc-700 text-zinc-300 hover:border-rose-700 hover:text-rose-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full border text-sm font-medium capitalize transition-all duration-150 ${colors[value]}`}
    >
      {value}
    </button>
  );
}

function CountChip({
  value,
  selected,
  onClick,
}: {
  value: QuestionCount;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-9 rounded-lg border text-sm font-semibold transition-all duration-150 ${
        selected
          ? "bg-indigo-900 text-white border-indigo-900"
          : "border-zinc-700 text-zinc-300 hover:border-indigo-800 hover:text-indigo-300"
      }`}
    >
      {value}
    </button>
  );
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

function QuestionCard({
  question,
  index,
  answer,
  onAnswer,
}: {
  question: Question;
  index: number;
  answer: AnswerState | undefined;
  onAnswer: (questionId: number, selectedIndex: number) => void;
}) {
  const isAnswered = answer !== undefined;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden">
      {/* Question header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900 text-indigo-300 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <p className="text-zinc-100 font-medium leading-snug">
            {question.question}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="px-5 pb-5 grid grid-cols-1 gap-2.5">
        {question.options.map((option, optIdx) => {
          let optionStyle =
            "border-zinc-700 text-zinc-300 hover:border-indigo-800 hover:bg-indigo-900/20";

          if (isAnswered) {
            if (optIdx === question.correctIndex) {
              optionStyle =
                "border-emerald-800 bg-emerald-900/25 text-emerald-300";
            } else if (optIdx === answer.selectedIndex && !answer.isCorrect) {
              optionStyle = "border-rose-800 bg-rose-900/25 text-rose-300";
            } else {
              optionStyle = "border-zinc-700 text-zinc-400 opacity-60";
            }
          }

          return (
            <button
              key={optIdx}
              type="button"
              disabled={isAnswered}
              onClick={() => onAnswer(question.id, optIdx)}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 disabled:cursor-default ${optionStyle}`}
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                {OPTION_LABELS[optIdx]}
              </span>
              <span>{option}</span>

              {/* Correct/wrong icon */}
              {isAnswered && optIdx === question.correctIndex && (
                <span className="ml-auto text-emerald-300">✓</span>
              )}
              {isAnswered &&
                optIdx === answer.selectedIndex &&
                !answer.isCorrect && (
                  <span className="ml-auto text-rose-300">✗</span>
                )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div className="mx-5 mb-5 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-400 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="font-semibold text-zinc-300">Explanation: </span>
          {question.explanation}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ answered, total }: { answered: number; total: number }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-indigo-800 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ResultsBlock({
  answers,
  total,
  startedAt,
  finishedAt,
  onRetry,
  onNew,
}: {
  answers: Record<number, AnswerState>;
  total: number;
  startedAt: number | null;
  finishedAt: number | null;
  onRetry: () => void;
  onNew: () => void;
}) {
  const correct = Object.values(answers).filter((a) => a.isCorrect).length;
  const accuracy = Math.round((correct / total) * 100);

  const elapsed =
    startedAt && finishedAt
      ? Math.round((finishedAt - startedAt) / 1000)
      : null;

  const elapsedStr = elapsed
    ? elapsed >= 60
      ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`
      : `${elapsed}s`
    : "—";

  const accuracyColor =
    accuracy >= 70
      ? "text-emerald-400"
      : accuracy >= 40
        ? "text-amber-400"
        : "text-rose-400";

  const accuracyBg =
    accuracy >= 70
      ? "bg-emerald-900/20 border-emerald-800"
      : accuracy >= 40
        ? "bg-amber-900/20 border-amber-800"
        : "bg-rose-900/20 border-rose-800";

  return (
    <div
      className={`rounded-2xl border p-6 animate-in fade-in slide-in-from-bottom-2 duration-400 ${accuracyBg}`}
    >
      <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-4">
        Results
      </h2>

      <div className="flex flex-wrap gap-6 items-end mb-6">
        {/* Score */}
        <div>
          <div className="text-4xl font-bold text-zinc-100">
            {correct}{" "}
            <span className="text-2xl text-zinc-400 font-normal">
              / {total}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">correct</div>
        </div>

        {/* Accuracy */}
        <div>
          <div className={`text-3xl font-bold ${accuracyColor}`}>
            {accuracy}%
          </div>
          <div className="text-xs text-zinc-400 mt-1">accuracy</div>
        </div>

        {/* Time */}
        <div>
          <div className="text-3xl font-bold text-zinc-300">{elapsedStr}</div>
          <div className="text-xs text-zinc-400 mt-1">time taken</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={onNew}
          className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-medium transition-colors"
        >
          New quiz
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function QuizPage() {
  // Config state
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [count, setCount] = useState<QuestionCount>(10);

  // Quiz + answer state
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const startedAtRef = useRef<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);

  const { mutate, data: quiz, isPending, error, reset } = useGenerateQuiz();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleGenerate = () => {
    if (!topic.trim()) return;
    reset();
    setAnswers({});
    startedAtRef.current = null;
    setFinishedAt(null);
    mutate({ topic: topic.trim(), difficulty, count });
  };

  const handleAnswer = useCallback(
    (questionId: number, selectedIndex: number) => {
      if (!quiz) return;

      const question = quiz.questions.find((q) => q.id === questionId);
      if (!question || answers[questionId] !== undefined) return;

      const now = Date.now();
      if (startedAtRef.current === null) startedAtRef.current = now;

      const isCorrect = selectedIndex === question.correctIndex;

      setAnswers((prev) => {
        const next = {
          ...prev,
          [questionId]: { selectedIndex, isCorrect, answeredAt: now },
        };

        if (Object.keys(next).length === quiz.questions.length) {
          setFinishedAt(now);
        }

        return next;
      });
    },
    [quiz, answers],
  );

  const handleRetry = () => {
    setAnswers({});
    startedAtRef.current = null;
    setFinishedAt(null);
  };

  const handleNew = () => {
    reset();
    setAnswers({});
    startedAtRef.current = null;
    setFinishedAt(null);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions.length ?? 0;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Quiz Generator</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pick a topic, set your difficulty, and test your knowledge.
          </p>
        </div>

        {/* ── Config card ── */}
        <div className="rounded-2xl border border-zinc-700 bg-zinc-900 shadow-sm p-5 space-y-4">
          {/* Topic */}
          <div>
            <label
              htmlFor="quiz-topic"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5"
            >
              Topic
            </label>
            <input
              id="quiz-topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder='e.g. "World War II" or "JavaScript closures"'
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700 transition"
            />
          </div>

          {/* Difficulty + Count + Button row */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Difficulty */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Difficulty
              </div>
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <DifficultyChip
                    key={d}
                    value={d}
                    selected={difficulty === d}
                    onClick={() => setDifficulty(d)}
                  />
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Questions
              </div>
              <div className="flex gap-1.5">
                {([5, 10, 15] as QuestionCount[]).map((n) => (
                  <CountChip
                    key={n}
                    value={n}
                    selected={count === n}
                    onClick={() => setCount(n)}
                  />
                ))}
              </div>
            </div>

            {/* Generate button — pushed right */}
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isPending || !topic.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Generating…
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Error state ── */}
        {error && (
          <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            {error.message}
          </div>
        )}

        {/* ── Quiz content ── */}
        {quiz && (
          <div className="space-y-5">
            {/* Meta row */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {quiz.topic}
                </span>{" "}
                · {quiz.questions.length} questions · ~{quiz.estimatedMinutes}m
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                {answeredCount} / {totalQuestions} answered
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar answered={answeredCount} total={totalQuestions} />

            {/* Question cards */}
            <div className="space-y-4">
              {quiz.questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={idx}
                  answer={answers[q.id]}
                  onAnswer={handleAnswer}
                />
              ))}
            </div>

            {/* Results block */}
            {allAnswered && (
              <ResultsBlock
                answers={answers}
                total={totalQuestions}
                startedAt={startedAtRef.current}
                finishedAt={finishedAt}
                onRetry={handleRetry}
                onNew={handleNew}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
