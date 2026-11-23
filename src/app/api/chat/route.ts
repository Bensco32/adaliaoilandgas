import { NextResponse } from "next/server";
import { ensureEmbeddings, retrieveAsync } from "@/lib/knowledge/retrieval";
import { buildSystemPrompt, composeAnswer, sanitizeMessages, UNAVAILABLE_RESPONSE } from "@/lib/knowledge/answer";
import { analyzeIntent, filterByIntent } from "@/lib/knowledge/intent";

/** Lightweight in-memory abuse protection (per server instance). */
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  return (forwarded?.split(",")[0] || real || "unknown").trim().slice(0, 100);
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (buckets.size > 500) buckets.clear();
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

export async function POST(req: Request) {
  if (isRateLimited(clientKey(req))) {
    return NextResponse.json(
      { reply: "You've sent several questions in a short time. Please try again in a moment or contact our team directly.", mode: "rate-limited" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const messages = sanitizeMessages(body?.messages);
    const lastUser = [...messages].reverse().find((message) => message.role === "user");

    if (!lastUser) {
      return NextResponse.json({ error: "Please include a question." }, { status: 400 });
    }

    // Prepare hosted embeddings when configured; local retrieval remains available.
    const embedding = await ensureEmbeddings();

    const history = messages
      .filter((message) => message.role === "user")
      .slice(0, -1)
      .map((message) => message.content);

    // Retrieve verified company knowledge before any answer is produced.
    const retrieval = await retrieveAsync(lastUser.content, history, 5);
    const analysis = analyzeIntent(lastUser.content);
    // Only records relevant to the detected intent reach the answer generator.
    const results = filterByIntent(retrieval.results, analysis);
    const sources = results.slice(0, 3).map((result) => ({
      title: result.record.title,
      category: result.record.category,
      source: result.record.source
    }));

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            temperature: 0.2,
            max_tokens: 600,
            messages: [
              { role: "system", content: buildSystemPrompt(results, analysis) },
              ...messages
            ]
          }),
          signal: AbortSignal.timeout(20000)
        });

        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content?.trim();
          if (content) {
            return NextResponse.json({ reply: content, mode: "ai", retrieval: retrieval.mode, embeddingModel: embedding.enabled ? embedding.model : null, sources });
          }
        }
      } catch {
        // Graceful degradation: answer from retrieved knowledge instead.
      }
    }

    // Retrieval-only mode (also the fallback when the AI service is unavailable).
    const reply = composeAnswer(lastUser.content, results, history, analysis);
    return NextResponse.json({
      reply: reply || UNAVAILABLE_RESPONSE,
      mode: apiKey ? "retrieval-fallback" : "retrieval",
      retrieval: retrieval.mode,
      embeddingModel: embedding.enabled ? embedding.model : null,
      sources
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process your request right now. Please try again or use the Contact page." },
      { status: 500 }
    );
  }
}
