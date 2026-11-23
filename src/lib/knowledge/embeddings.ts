import { createHash } from "node:crypto";

/**
 * Hosted transformer embedding provider (OpenAI-compatible /v1/embeddings).
 *
 * Credentials are server-side only. This module never gets imported by client
 * components. When no key is configured it simply reports `enabled: false`,
 * and the caller uses the existing local hashed-feature retrieval instead.
 */

export interface EmbeddingConfig {
  enabled: boolean;
  provider: "openai-compatible";
  model: string;
  baseUrl: string;
  dimensions?: number;
}

export interface EmbeddingStats {
  successfulEmbeddings: number;
  failedEmbeddings: number;
  lastSuccessAt: string | null;
  lastError: string | null;
}

const stats: EmbeddingStats = {
  successfulEmbeddings: 0,
  failedEmbeddings: 0,
  lastSuccessAt: null,
  lastError: null
};

const textCache = new Map<string, number[]>();
const MAX_CACHE_SIZE = 1000;

function cleanBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getEmbeddingConfig(): EmbeddingConfig {
  const apiKey = process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || "";
  const rawDimensions = Number.parseInt(process.env.EMBEDDING_DIMENSIONS || "", 10);
  return {
    enabled: Boolean(apiKey),
    provider: "openai-compatible",
    model: (process.env.EMBEDDING_MODEL || "text-embedding-3-small").trim(),
    baseUrl: cleanBaseUrl(process.env.EMBEDDING_BASE_URL || "https://api.openai.com/v1"),
    dimensions: Number.isFinite(rawDimensions) && rawDimensions > 0 ? rawDimensions : undefined
  };
}

export function cacheKey(model: string, text: string): string {
  return `${model}:${createHash("sha256").update(text).digest("hex")}`;
}

export function getEmbeddingStats(): EmbeddingStats {
  return { ...stats };
}

export function resetEmbeddingStats(): void {
  stats.successfulEmbeddings = 0;
  stats.failedEmbeddings = 0;
  stats.lastError = null;
}

export function clearEmbeddingCache(): void {
  textCache.clear();
}

/** Cosine similarity that works with any vector dimension from the provider. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates real transformer embeddings through the configured provider.
 * Throws on any failure so the caller can fall back to local retrieval.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const config = getEmbeddingConfig();
  if (!config.enabled) throw new Error("Embedding provider is not configured");

  const apiKey = process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || "";
  const unique = Array.from(new Set(texts.map((text) => text.trim()).filter(Boolean)));
  if (!unique.length) return [];

  const missing = unique.filter((text) => !textCache.has(cacheKey(config.model, text)));
  const batchSize = 96;

  try {
    for (let i = 0; i < missing.length; i += batchSize) {
      const batch = missing.slice(i, i + batchSize);
      const response = await fetch(`${config.baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          input: batch,
          ...(config.dimensions ? { dimensions: config.dimensions } : {})
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`Embedding API returned ${response.status}`);
      }

      const payload = await response.json();
      const data = Array.isArray(payload?.data) ? payload.data : [];
      if (data.length !== batch.length) {
        throw new Error("Embedding API returned an unexpected number of vectors");
      }

      data
        .slice()
        .sort((a: { index?: number }, b: { index?: number }) => (a.index ?? 0) - (b.index ?? 0))
        .forEach((item: { embedding?: unknown }, index: number) => {
          const vector = Array.isArray(item.embedding)
            ? item.embedding.map((value) => Number(value)).filter((value) => Number.isFinite(value))
            : [];
          if (!vector.length) throw new Error("Embedding API returned an invalid vector");
          textCache.set(cacheKey(config.model, batch[index]), vector);
        });
    }

    if (textCache.size > MAX_CACHE_SIZE) {
      const keys = Array.from(textCache.keys());
      keys.slice(0, keys.length - MAX_CACHE_SIZE).forEach((key) => textCache.delete(key));
    }

    stats.successfulEmbeddings += missing.length;
    stats.lastSuccessAt = new Date().toISOString();
    stats.lastError = null;
    return unique.map((text) => textCache.get(cacheKey(config.model, text))!);
  } catch (error) {
    stats.failedEmbeddings += 1;
    stats.lastError = error instanceof Error ? error.message : String(error);
    throw error;
  }
}
