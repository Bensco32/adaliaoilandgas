import { promises as fs } from "node:fs";
import path from "node:path";
import type { KnowledgeChunk } from "./chunks";

/** On-disk vector cache. No external database is required for this project. */

const DATA_DIR = path.join(process.cwd(), "data");
const EMBEDDINGS_FILE = path.join(DATA_DIR, "knowledge-embeddings.json");

export interface CachedEmbedding {
  key: string;
  model: string;
  recordId: string;
  chunkIndex: number;
  version: string;
  source: string;
  indexedAt: string;
  embedding: number[];
}

export interface FailedEmbedding {
  key: string;
  error: string;
  attemptedAt: string;
}

export interface EmbeddingCache {
  model: string;
  provider: string;
  createdAt: string;
  lastSuccessfulIndexingAt: string | null;
  entries: CachedEmbedding[];
  failed: FailedEmbedding[];
}

function emptyCache(model: string, provider: string): EmbeddingCache {
  return {
    model,
    provider,
    createdAt: new Date().toISOString(),
    lastSuccessfulIndexingAt: null,
    entries: [],
    failed: []
  };
}

export async function loadEmbeddingCache(model: string, provider: string): Promise<EmbeddingCache> {
  try {
    const raw = await fs.readFile(EMBEDDINGS_FILE, "utf8");
    const parsed = JSON.parse(raw) as EmbeddingCache;
    // Never mix vectors from different models or dimensions.
    if (!parsed || parsed.model !== model || parsed.provider !== provider || !Array.isArray(parsed.entries)) {
      return emptyCache(model, provider);
    }
    return {
      ...parsed,
      entries: parsed.entries.filter(
        (entry) =>
          entry &&
          typeof entry.key === "string" &&
          typeof entry.recordId === "string" &&
          Array.isArray(entry.embedding) &&
          entry.embedding.every((value) => typeof value === "number")
      ),
      failed: Array.isArray(parsed.failed) ? parsed.failed : []
    };
  } catch {
    return emptyCache(model, provider);
  }
}

export async function saveEmbeddingCache(cache: EmbeddingCache): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(EMBEDDINGS_FILE, JSON.stringify(cache, null, 2), "utf8");
}

export async function upsertEmbeddings(
  cache: EmbeddingCache,
  chunks: KnowledgeChunk[],
  vectors: Map<string, number[]>
): Promise<EmbeddingCache> {
  const indexedAt = new Date().toISOString();
  const byKey = new Map(cache.entries.map((entry) => [entry.key, entry]));

  for (const chunk of chunks) {
    const key = `${cache.model}:${chunk.version}`;
    const vector = vectors.get(key);
    if (!vector) continue;
    byKey.set(key, {
      key,
      model: cache.model,
      recordId: chunk.recordId,
      chunkIndex: chunk.chunkIndex,
      version: chunk.version,
      source: chunk.source,
      indexedAt,
      embedding: vector
    });
  }

  // Remove entries whose source chunk no longer exists.
  const validKeys = new Set(chunks.map((chunk) => `${cache.model}:${chunk.version}`));
  for (const key of byKey.keys()) if (!validKeys.has(key)) byKey.delete(key);

  return {
    ...cache,
    entries: Array.from(byKey.values()),
    lastSuccessfulIndexingAt: indexedAt,
    failed: cache.failed.filter((failure) => !validKeys.has(failure.key))
  };
}

export async function markEmbeddingFailures(cache: EmbeddingCache, keys: string[], error: string): Promise<EmbeddingCache> {
  const attemptedAt = new Date().toISOString();
  const failed = [...cache.failed];
  for (const key of keys) {
    const existing = failed.findIndex((item) => item.key === key);
    const entry = { key, error: error.slice(0, 300), attemptedAt };
    if (existing >= 0) failed[existing] = entry;
    else failed.push(entry);
  }
  return { ...cache, failed };
}

export async function clearFailedEmbeddings(cache: EmbeddingCache): Promise<EmbeddingCache> {
  return { ...cache, failed: [] };
}

export async function clearEmbeddingCacheFile(): Promise<void> {
  try {
    await fs.unlink(EMBEDDINGS_FILE);
  } catch {
    // Nothing to clear.
  }
}
