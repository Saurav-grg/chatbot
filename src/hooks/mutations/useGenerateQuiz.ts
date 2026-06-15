import { useMutation } from "@tanstack/react-query";
import type { Quiz } from "@/app/api/quiz/route";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GenerateQuizInput {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  count: 5 | 10 | 15;
}

// ── Fetcher ────────────────────────────────────────────────────────────────────

async function generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
  const res = await fetch("/api/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Request failed: ${res.status}`,
    );
  }

  return res.json() as Promise<Quiz>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * Mutation hook that generates a fresh quiz from the API.
 * No query-key caching — every call produces a new quiz.
 *
 * @example
 * const { mutate, data, isPending, error } = useGenerateQuiz();
 * mutate({ topic: "JavaScript", difficulty: "medium", count: 10 });
 */
export function useGenerateQuiz() {
  return useMutation<Quiz, Error, GenerateQuizInput>({
    mutationFn: generateQuiz,
  });
}
