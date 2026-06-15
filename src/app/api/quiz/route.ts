import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// ── Zod schemas ────────────────────────────────────────────────────────────────

const QuestionSchema = z.object({
  id: z.number(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().min(0).max(3),
  explanation: z.string(),
});

const QuizSchema = z.object({
  questions: z.array(QuestionSchema),
  topic: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  estimatedMinutes: z.number(),
});

export type Quiz = z.infer<typeof QuizSchema>;
export type Question = z.infer<typeof QuestionSchema>;

// ── Request body ───────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  topic: z.string().min(1).max(200),
  difficulty: z.enum(["easy", "medium", "hard"]),
  count: z.number().min(5).max(15),
});

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { topic, difficulty, count } = parsed.data;

    const difficultyGuide = {
      easy: "straightforward recall and basic comprehension; avoid tricks or edge cases",
      medium:
        "application and analysis; require some reasoning beyond surface facts",
      hard: "synthesis, evaluation, and nuanced distinctions; include plausible distractors",
    }[difficulty];

    const systemPrompt = `You are a quiz generator. Respond ONLY with a valid JSON object — no markdown fences, no explanation, no extra keys.

The JSON must match this exact shape:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A text", "B text", "C text", "D text"],
      "correctIndex": 0,
      "explanation": "..."
    }
  ],
  "topic": "...",
  "difficulty": "easy" | "medium" | "hard",
  "estimatedMinutes": number
}

Rules:
- Always produce exactly ${count} questions.
- Each question has exactly 4 options. Do NOT prefix them with A) B) C) D) — the UI handles that.
- correctIndex is the 0-based index of the correct option in the options array.
- explanation is 1–2 sentences shown after the user answers; briefly explain why the correct answer is right.
- estimatedMinutes is a realistic reading/thinking estimate for all questions combined.
- difficulty field in output must be "${difficulty}".
- topic field in output should be the canonical name of the topic.`;

    const userPrompt = `Generate a ${difficulty} quiz about: "${topic}"
Difficulty guidance: ${difficultyGuide}
Number of questions: ${count}`;

    const completion = await client.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Strip potential markdown fences defensively
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed2: unknown;
    try {
      parsed2 = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Model returned non-JSON response", raw },
        { status: 502 },
      );
    }

    const validated = QuizSchema.safeParse(parsed2);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Model response failed schema validation",
          details: validated.error.flatten(),
          raw: parsed2,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(validated.data);
  } catch (err) {
    console.error("[quiz/route] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
