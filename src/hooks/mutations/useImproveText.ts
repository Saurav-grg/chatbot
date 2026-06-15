import { useMutation } from "@tanstack/react-query";
import { WritingResponse } from "@/app/api/writing/route"; // re-use the zod-inferred type

// ─── Payload ───────────────────────────────────────────────────────────────────
interface ImproveTextPayload {
  text: string;
  instruction?: string;
}

// ─── Fetcher ───────────────────────────────────────────────────────────────────
async function improveText(
  payload: ImproveTextPayload,
): Promise<WritingResponse> {
  const response = await fetch("/api/writing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error ?? "Failed to improve text");
  }

  return response.json() as Promise<WritingResponse>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useImproveText() {
  return useMutation({
    mutationFn: improveText,
  });
}
