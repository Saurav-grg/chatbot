import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
// import { env } from '@/env'; // adjust to your env setup

// ─── Request schema ────────────────────────────────────────────────────────────
const RequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
  instruction: z.string().optional().default("Improve the writing quality"),
});

// ─── Response schema ───────────────────────────────────────────────────────────
export const WritingResponseSchema = z.object({
  improvedText: z.string(),
  suggestions: z.array(
    z.object({
      type: z.enum([
        "structure",
        "clarity",
        "tone",
        "word_choice",
        "conciseness",
      ]),
      description: z.string(),
    }),
  ),
  mistakes: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      reason: z.string(),
    }),
  ),
  stats: z.object({
    originalWordCount: z.number(),
    improvedWordCount: z.number(),
    readabilityScore: z.enum(["beginner", "intermediate", "advanced"]),
  }),
});

export type WritingResponse = z.infer<typeof WritingResponseSchema>;

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, instruction } = RequestSchema.parse(body);

    const openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    const systemPrompt = `You are an expert writing editor. When given text and an instruction, you return a structured JSON analysis.

You MUST respond with ONLY valid JSON — no markdown, no code fences, no explanation.

The JSON must match this exact shape:
{
  "improvedText": "the rewritten text",
  "suggestions": [
    {
      "type": "structure" | "clarity" | "tone" | "word_choice" | "conciseness",
      "description": "actionable suggestion"
    }
  ],
  "mistakes": [
    {
      "original": "the original phrase",
      "corrected": "the corrected phrase",
      "reason": "why it was changed"
    }
  ],
  "stats": {
    "originalWordCount": <number>,
    "improvedWordCount": <number>,
    "readabilityScore": "beginner" | "intermediate" | "advanced"
  }
}`;

    const userPrompt = `Instruction: ${instruction}\n\nText:\n${text}`;

    const completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from Gemini");

    const parsed = WritingResponseSchema.parse(JSON.parse(raw));

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 },
      );
    }
    console.error("[writing/route]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
