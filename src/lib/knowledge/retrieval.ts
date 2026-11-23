import { companyKnowledge } from "./company-knowledge";
import { countDynamicDocuments, loadDynamicDocuments } from "./store";
import { chunkRecords, type KnowledgeChunk } from "./chunks";
import { clearEmbeddingCacheFile, loadEmbeddingCache, markEmbeddingFailures, saveEmbeddingCache, upsertEmbeddings, type EmbeddingCache } from "./embedding-store";
import { clearEmbeddingCache, cosineSimilarity, embedTexts, getEmbeddingConfig, getEmbeddingStats, resetEmbeddingStats } from "./embeddings";
import type { EmbeddingStatus, KnowledgeRecord, RetrievalMode, RetrievalResult, SemanticSearchResponse, SemanticSearchResult } from "./types";

const DEFAULT_TOP_K = Math.max(1, Math.min(20, Number.parseInt(process.env.RAG_TOP_K || "5", 10) || 5));
const MIN_HOSTED_SCORE = Number.parseFloat(process.env.EMBEDDING_MIN_SCORE || "0.22") || 0.22;

/**
 * Local vector-search retrieval.
 *
 * Uses deterministic hashed feature vectors with intent/synonym expansion and
 * cosine similarity. No external embedding API or vector database is required,
 * so the assistant works without API keys or extra hosting costs. Retrieved
 * records are always treated as information, never as instructions.
 */

const DIMENSIONS = 256;

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "can", "could", "would", "should", "will", "shall", "may", "might",
  "of", "to", "in", "on", "at", "for", "from", "by", "with", "about", "into", "over", "under",
  "i", "you", "we", "they", "it", "he", "she", "my", "your", "our", "their", "this", "that",
  "these", "those", "me", "us", "them", "what", "which", "who", "whom", "whose", "when",
  "where", "why", "how", "there", "here", "please", "tell", "have", "has", "had", "get",
  "got", "just", "also", "than", "then", "so", "as", "if", "not", "no", "yes", "am"
]);

/** Intent expansion: maps many phrasings onto the concepts used in the records. */
const INTENTS: Array<{ patterns: RegExp[]; terms: string[]; category?: string }> = [
  { patterns: [/servic|offer|capab|what do you do|kind of work|business|products/i], terms: ["services", "divisions", "capabilities", "offer", "portfolio"], category: "Products & Services" },
  { patterns: [/drill|borehole|well|rig|mud log/i], terms: ["drilling", "well", "onshore", "offshore", "workover", "mud logging"], category: "Drilling Operations" },
  { patterns: [/lift|crude|marine|vessel|ship|logistic|evacuat|charter|offshore supply|terminal/i], terms: ["crude lifting", "marine", "logistics", "vessel chartering", "storage terminal"], category: "Lifting Operations" },
  { patterns: [/gas|lpg|cng|lng|reticulat|pipeline/i], terms: ["gas", "lpg", "cng", "lng", "gas plant", "reticulation"], category: "Gas Services" },
  { patterns: [/petroleum|pms|ago|dpk|fuel|lubricant|diesel|kerosene/i], terms: ["petroleum", "pms", "ago", "dpk", "base oil", "lubricants", "distribution"], category: "Petroleum Services" },
  { patterns: [/safet|hse|health|environment|ppe|risk|accident/i], terms: ["safety", "hse", "environment", "risk management", "personnel protection"], category: "Health, Safety & Environment" },
  { patterns: [/partner|collaborat|joint venture|business relationship/i], terms: ["partnership", "strategic", "collaboration", "local international"], category: "Business Partnerships" },
  { patterns: [/contact|phone|call|email|address|location|office|reach|rc number|registration/i], terms: ["contact", "phone", "email", "address", "website", "social"], category: "Contact Information" },
  { patterns: [/vision|mission|values|principle|culture/i], terms: ["vision", "mission", "values", "culture"], category: "Vision & Mission" },
  { patterns: [/team|expert|experience|people|staff|employee|qualified/i], terms: ["team", "experienced", "technical", "people", "workforce"], category: "Workforce & Technical Expertise" },
  { patterns: [/qualit|reliab|transparent|timely|assurance/i], terms: ["quality", "reliability", "transparency", "timely delivery"], category: "Quality Management" },
  { patterns: [/project|client|case study|track record|certif|licen|iso|award|years of experience|price|cost|capacity|how much/i], terms: ["project", "clients", "certification", "years", "price", "capacity", "unavailable", "verified"], category: "Other Relevant Company Information" },
  { patterns: [/different|advantage|why choose|unique|strength|better/i], terms: ["why choose", "strength", "advantage", "one group", "integrated"], category: "Core Values" },
  { patterns: [/quote|quotation|consultation|enquiry|request/i], terms: ["quotation", "consultation", "enquiry", "contact form"], category: "Operational Procedures" },
  { patterns: [/privacy|personal data|data protection/i], terms: ["privacy", "data", "consent", "policy"], category: "Operational Procedures" },
  { patterns: [/meaning|stands for|define|definition|what is lpg|what is cng|what is lng|general/i], terms: ["meaning", "definition", "terminology"] }
];

const GENERAL_QUESTION = /^(what (is|are)|what does .{1,25} mean)\b|\b(meaning|stands for|define|definition|in general|terminology)\b/i;

/** Remove the company name before intent matching so "Gas Ltd" never triggers gas intent. */
function normalizedForIntent(text: string): string {
  return text
    .replace(/adaliaoilandgasltd|adalia oil and gas ltd|adalia oil and gas|adalia/gi, " ")
    .replace(/oil and gas/gi, " ");
}

function hash(token: string): number {
  let value = 2166136261;
  for (let i = 0; i < token.length; i++) {
    value ^= token.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

function tokenize(text: string): string[] {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/^-+|-+$/g, ""))
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function features(text: string): string[] {
  const base = tokenize(text);
  const expanded = [...base];
  for (const token of base) {
    for (const intent of INTENTS) {
      if (intent.patterns.some((pattern) => pattern.test(token))) {
        expanded.push(...intent.terms);
      }
    }
  }
  // Add intent terms triggered by multi-word patterns in the original text.
  for (const intent of INTENTS) {
    if (intent.patterns.some((pattern) => pattern.test(normalizedForIntent(text)))) expanded.push(...intent.terms);
  }
  return expanded;
}

function embed(text: string, weight = 1): Float32Array {
  const vector = new Float32Array(DIMENSIONS);
  const tokens = features(text);
  for (const token of tokens) {
    vector[hash(token) % DIMENSIONS] += weight;
  }
  // Bigrams capture short phrases such as "crude lifting" and "gas plant".
  const base = tokenize(text);
  for (let i = 0; i < base.length - 1; i++) {
    const bigram = `${base[i]}_${base[i + 1]}`;
    vector[hash(bigram) % DIMENSIONS] += weight * 0.6;
  }
  return vector;
}

/** Raw vector for definition-style questions, where intent expansion would blur the answer. */
function embedRaw(text: string, weight = 1): Float32Array {
  const vector = new Float32Array(DIMENSIONS);
  for (const token of tokenize(text)) vector[hash(token) % DIMENSIONS] += weight;
  return vector;
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface IndexEntry {
  record: KnowledgeRecord;
  vector: Float32Array;
  tokens: Set<string>;
  category: string;
}

let index: IndexEntry[] = [];
let lastIndexedAt = new Date().toISOString();
let lastSyncAt = new Date().toISOString();
let indexErrors: string[] = [];

export function buildIndex(): number {
  const records: KnowledgeRecord[] = [...companyKnowledge];
  index = records.map((record) => ({
    record,
    vector: embed(`${record.title} ${record.keywords.join(" ")} ${record.content}`, 1),
    tokens: new Set(features(`${record.title} ${record.keywords.join(" ")} ${record.content}`)),
    category: record.category
  }));
  lastIndexedAt = new Date().toISOString();
  lastSyncAt = lastIndexedAt;
  return index.length;
}

export async function buildIndexAsync(): Promise<number> {
  const records: KnowledgeRecord[] = [...companyKnowledge];
  try {
    const dynamic = await loadDynamicDocuments();
    records.push(...dynamic);
  } catch (error) {
    indexErrors = [`Failed to load uploaded documents: ${String(error)}`];
  }
  index = records.map((record) => ({
    record,
    vector: embed(`${record.title} ${record.keywords.join(" ")} ${record.content}`, 1),
    tokens: new Set(features(`${record.title} ${record.keywords.join(" ")} ${record.content}`)),
    category: record.category
  }));
  lastIndexedAt = new Date().toISOString();
  lastSyncAt = lastIndexedAt;
  return index.length;
}

let asyncReady: Promise<void> | null = null;

/** Ensures uploaded documents are included in the index (once per server process). */
export function ensureIndexAsync(): Promise<void> {
  if (!asyncReady) {
    asyncReady = buildIndexAsync().then(() => undefined);
  }
  return asyncReady;
}

/** Forces a fresh rebuild, used by the protected admin endpoint. */
export function refreshIndex(): Promise<void> {
  hostedReady = false;
  asyncReady = buildIndexAsync().then(() => undefined);
  return asyncReady;
}

export function ensureIndex(): void {
  if (!index.length) buildIndex();
}

export function retrieve(query: string, history: string[] = [], topK = 5): RetrievalResult[] {
  ensureIndex();
  const combined = `${query} ${query} ${history.slice(-3).join(" ")}`;
  const intentText = normalizedForIntent(combined);
  const wantsGeneral = GENERAL_QUESTION.test(query);
  const pureDefinition = /^what (is|are) [a-z0-9 -]{1,30}\??$/i.test(query.trim()) && !/\b(your|adalia|company|approach|services|divisions)\b/i.test(query);
  const queryVector = pureDefinition ? embedRaw(combined, 1) : embed(combined, 1);
  const queryTokens = new Set(pureDefinition ? tokenize(combined) : features(combined));

  const boostedCategories = new Set<string>();
  for (const intent of INTENTS) {
    if (intent.category && intent.patterns.some((pattern) => pattern.test(intentText))) {
      boostedCategories.add(intent.category);
    }
  }

  // Broad questions should surface overview/division records, not one narrow service.
  const specificDivision = ["Drilling Operations", "Lifting Operations", "Gas Services", "Petroleum Services"]
    .some((category) => boostedCategories.has(category));
  const broadQuestion = /\b(service|services|offer|capabilities|business|portfolio|products|overview|company)\b/i.test(query) || /^(what (does|do) .{0,60}\bdo\b|what is adalia|tell me about (your|the) company)/i.test(query);
  const differentiator = /\b(different|advantage|unique|why choose|strength|better than)\b/i.test(query);
  const applyBroad = broadQuestion && !specificDivision;

  const scored = index.map((entry) => {
    let score = cosine(queryVector, entry.vector);
    // Exact concept overlap gives a small, stable boost on top of vector similarity.
    let overlap = 0;
    for (const token of queryTokens) if (entry.tokens.has(token)) overlap++;
    score += Math.min(overlap, 8) * 0.012;
    if (boostedCategories.has(entry.category)) score += 0.12;
    if (applyBroad) {
      if (entry.record.id.startsWith("division-") || entry.record.id.startsWith("overview-") || entry.record.id === "faq-2" || entry.record.id === "faq-1") score += 0.2;
      if (entry.record.id.includes("-service-")) score -= 0.25;
    }
    if (differentiator && ["history-single-partner", "why-choose-1", "overview-four-divisions"].includes(entry.record.id)) score += 0.3;
    if (entry.record.general) score += wantsGeneral ? 0.8 : -0.35;
    return { record: entry.record, score };
  });

  return scored
    .filter((item) => item.score > 0.06)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/* -------------------------------------------------------------------------- */
/* Hosted transformer embeddings (primary), with local retrieval as fallback.  */
/* -------------------------------------------------------------------------- */

interface HostedEntry {
  record: KnowledgeRecord;
  chunk: KnowledgeChunk;
  vector: number[];
}

let hostedIndex: HostedEntry[] = [];
let hostedReady = false;

async function loadAllRecords(): Promise<KnowledgeRecord[]> {
  const records = [...companyKnowledge];
  try {
    records.push(...(await loadDynamicDocuments()));
  } catch (error) {
    indexErrors = [`Failed to load uploaded documents: ${String(error)}`];
  }
  return records;
}

/**
 * Builds the hosted vector index from cleaned, chunked records.
 * If any embedding operation fails, hosted mode is disabled entirely so
 * local and hosted vectors are never mixed.
 */
async function ensureHostedIndex(options: { force?: boolean; retryFailed?: boolean } = {}): Promise<boolean> {
  if (hostedReady && !options.force && !options.retryFailed) return true;

  const config = getEmbeddingConfig();
  if (!config.enabled) {
    hostedIndex = [];
    hostedReady = false;
    return false;
  }

  let cache = await loadEmbeddingCache(config.model, config.provider);

  if (options.force) {
    await clearEmbeddingCacheFile();
    clearEmbeddingCache();
    resetEmbeddingStats();
    cache = { ...cache, entries: [], failed: [], lastSuccessfulIndexingAt: null };
  } else if (options.retryFailed) {
    cache = { ...cache, failed: [] };
  }

  const records = await loadAllRecords();
  const recordById = new Map(records.map((record) => [record.id, record]));
  const chunks = chunkRecords(records);
  const keyOf = (chunk: KnowledgeChunk) => `${config.model}:${chunk.version}`;

  const cachedKeys = new Set(cache.entries.map((entry) => entry.key));
  const missing = chunks.filter((chunk) => !cachedKeys.has(keyOf(chunk)));

  if (missing.length) {
    try {
      const vectors = await embedTexts(missing.map((chunk) => chunk.text));
      const vectorMap = new Map<string, number[]>();
      missing.forEach((chunk, index) => vectorMap.set(keyOf(chunk), vectors[index]));
      cache = await upsertEmbeddings(cache, chunks, vectorMap);
      await saveEmbeddingCache(cache);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      cache = await markEmbeddingFailures(cache, missing.map(keyOf), message);
      await saveEmbeddingCache(cache);
      hostedIndex = [];
      hostedReady = false;
      return false;
    }
  }

  hostedIndex = chunks
    .map((chunk) => {
      const entry = cache.entries.find((item) => item.key === keyOf(chunk));
      const record = recordById.get(chunk.recordId);
      return entry && record ? { record, chunk, vector: entry.embedding } : null;
    })
    .filter((entry): entry is HostedEntry => Boolean(entry));

  hostedReady = hostedIndex.length === chunks.length && chunks.length > 0;
  return hostedReady;
}

async function retrieveHosted(query: string, topK: number): Promise<{ results: RetrievalResult[]; semantic: SemanticSearchResult[] } | null> {
  if (!hostedReady || !hostedIndex.length) return null;

  let queryVector: number[];
  try {
    [queryVector] = await embedTexts([query]);
  } catch {
    return null;
  }
  if (!queryVector) return null;

  const wantsGeneral = /^(what (is|are)|what does .{1,25} mean)\b|\b(meaning|stands for|define|definition|in general|terminology)\b/i.test(query);
  const wantsUnverified = /\b(project|client|certif|licen|iso|award|price|cost|capacity|years of experience|phone|email|address|rc number)\b/i.test(query);
  const intentText = normalizedForIntent(query);
  const relevantCategories = new Set<string>();
  for (const intent of INTENTS) {
    if (intent.category && intent.patterns.some((pattern) => pattern.test(intentText))) {
      relevantCategories.add(intent.category);
    }
  }

  const scored = hostedIndex
    .filter((entry) => !entry.record.general || wantsGeneral)
    .filter((entry) => !["projects-unavailable", "unverified-details", "contact-details-unavailable"].includes(entry.record.id) || wantsUnverified)
    .map((entry) => {
      let score = cosineSimilarity(queryVector, entry.vector);
      // Small intent boost plus source-relevance checks guard against noisy vectors.
      if (relevantCategories.has(entry.record.category)) score += 0.12;
      return { entry, score };
    })
    .filter((item) => item.score >= MIN_HOSTED_SCORE)
    .sort((a, b) => b.score - a.score);

  // Keep the best chunk per source record, and drop near-duplicate text.
  const seenRecords = new Set<string>();
  const seenTexts = new Set<string>();
  const semantic: SemanticSearchResult[] = [];

  for (const item of scored) {
    if (seenRecords.has(item.entry.record.id) || seenTexts.has(item.entry.chunk.text)) continue;
    seenRecords.add(item.entry.record.id);
    seenTexts.add(item.entry.chunk.text);
    semantic.push({
      record: item.entry.record,
      score: item.score,
      chunkText: item.entry.chunk.text,
      source: item.entry.record.source,
      category: item.entry.record.category
    });
    if (semantic.length >= topK) break;
  }

  return {
    results: semantic.map((item) => ({ record: item.record, score: item.score })),
    semantic
  };
}

/** Retrieves company knowledge using hosted embeddings first, local hashing second. */
export async function retrieveAsync(
  query: string,
  history: string[] = [],
  topK = DEFAULT_TOP_K
): Promise<{ results: RetrievalResult[]; mode: RetrievalMode; semantic?: SemanticSearchResult[] }> {
  await ensureIndexAsync();

  try {
    const hosted = await retrieveHosted(query, topK);
    if (hosted?.results.length) {
      return { results: hosted.results, mode: "hosted", semantic: hosted.semantic };
    }
  } catch {
    // Any provider problem falls through to the preserved local system.
  }

  return { results: retrieve(query, history, topK), mode: "local" };
}

export async function embeddingStatus(): Promise<EmbeddingStatus> {
  const config = getEmbeddingConfig();
  const cache = await loadEmbeddingCache(config.model, config.provider);
  const stats = getEmbeddingStats();
  return {
    provider: config.provider,
    model: config.model,
    enabled: config.enabled,
    indexedDocuments: new Set(cache.entries.map((entry) => entry.recordId)).size,
    indexedChunks: cache.entries.length,
    successfulEmbeddings: stats.successfulEmbeddings,
    failedEmbeddings: stats.failedEmbeddings + cache.failed.length,
    lastSuccessfulIndexingAt: cache.lastSuccessfulIndexingAt,
    retrievalMode: hostedReady ? "hosted" : "local"
  };
}

export async function ensureEmbeddings(): Promise<EmbeddingStatus> {
  if (getEmbeddingConfig().enabled) await ensureHostedIndex();
  return embeddingStatus();
}

/** Admin rebuild / re-index / retry operations. */
export async function rebuildEmbeddings(options: { force?: boolean; retryFailed?: boolean } = {}): Promise<EmbeddingStatus> {
  await ensureHostedIndex(options);
  return embeddingStatus();
}

/** Admin semantic-search test: shows chunks, scores, sources and the mode used. */
export async function semanticSearch(question: string, topK = DEFAULT_TOP_K): Promise<SemanticSearchResponse> {
  const clean = String(question).trim().slice(0, 2000);
  const config = getEmbeddingConfig();
  const result = await retrieveAsync(clean, [], topK);
  const semantic = result.semantic ?? result.results.map((item) => ({
    record: item.record,
    score: item.score,
    chunkText: item.record.content,
    source: item.record.source,
    category: item.record.category
  }));
  return {
    question: clean,
    mode: result.mode,
    results: semantic,
    provider: config.provider,
    model: config.model
  };
}

export async function indexStatus(): Promise<{
  recordCount: number;
  categoryCount: number;
  categories: string[];
  lastIndexedAt: string;
  lastSyncAt: string;
  dynamicDocumentCount: number;
  errors: string[];
  sources: string[];
  embedding: EmbeddingStatus;
}> {
  const dynamicDocumentCount = await countDynamicDocuments();
  const categories = Array.from(new Set(index.map((entry) => entry.record.category))).sort();
  const sources = Array.from(new Set(index.map((entry) => entry.record.source))).sort();
  return {
    recordCount: index.length,
    categoryCount: categories.length,
    categories,
    lastIndexedAt,
    lastSyncAt,
    dynamicDocumentCount,
    errors: indexErrors,
    sources,
    embedding: await embeddingStatus()
  };
}

buildIndex();
