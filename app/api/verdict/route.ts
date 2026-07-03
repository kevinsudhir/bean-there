import { NextResponse } from "next/server";

/**
 * Server-side route that drafts a café verdict with the Gemini API.
 *
 * Why a server route? The Gemini key must never reach the browser. The form
 * (client) POSTs the café's scores/items here; this route — running on the
 * server — adds the secret key and calls Gemini, then returns just the text.
 * The key lives in the GEMINI_API_KEY env var (no NEXT_PUBLIC_ prefix, so it
 * stays server-only).
 */

// Fast, free-tier Gemini model. Swap here if you ever change models.
const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

interface VerdictRequest {
  name: string;
  area: string;
  scores: Record<string, number>;
  items: { name: string; who: string; rating: number; star?: boolean }[];
  reviewers: { him: string; her: string };
}

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "The verdict feature isn't configured (no API key)." },
      { status: 503 },
    );
  }

  let body: VerdictRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { name, area, scores, items, reviewers } = body;
  if (!name || !scores) {
    return NextResponse.json(
      { error: "Missing café details." },
      { status: 400 },
    );
  }

  const scoreLine = Object.entries(scores)
    .map(([k, v]) => `${k} ${v}/5`)
    .join(", ");
  const itemLine =
    items && items.length
      ? items
          .map(
            (it) =>
              `${it.name} (${it.who === "him" ? reviewers.him : it.who === "her" ? reviewers.her : "shared"}, ${it.rating}/5${it.star ? ", standout" : ""})`,
          )
          .join("; ")
      : "no specific items noted";

  const prompt = `You write short, punchy café reviews for a Manchester coffee blog called "Bean There", run by a couple (${reviewers.him} and ${reviewers.her}) who score cafés together.

Write a verdict for this café in their voice: warm but honest, a little wry, British spelling, no marketing fluff, no clichés like "hidden gem" unless earned. 2 to 4 sentences. Do not use em-dashes. Do not restate the scores as numbers; instead let the scores guide the tone (higher = more praise, a merely-decent score gets gentle honesty). Return ONLY the verdict text, nothing else.

Café: ${name}${area ? `, ${area}` : ""}
Category scores: ${scoreLine}
What they had: ${itemLine}`;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 800,
          // gemini-2.5-flash is a "thinking" model and reasoning tokens count
          // against the output budget, which was truncating the verdict.
          // A short verdict needs no thinking, so we switch it off.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Gemini error:", res.status, detail);
      return NextResponse.json(
        { error: "The verdict service didn't respond. Try again." },
        { status: 502 },
      );
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const text: string | undefined = Array.isArray(parts)
      ? parts
          .map((p: { text?: string }) => p.text ?? "")
          .join("")
          .trim() || undefined
      : undefined;

    if (!text) {
      return NextResponse.json(
        { error: "No verdict came back. Try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ verdict: text.trim() });
  } catch (e) {
    console.error("Verdict route error:", e);
    return NextResponse.json(
      { error: "Something went wrong generating the verdict." },
      { status: 500 },
    );
  }
}
