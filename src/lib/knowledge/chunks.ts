import { createHash } from "node:crypto";
import type { KnowledgeRecord } from "./types";

/** A text chunk ready for embedding, with its source and provenance preserved. */
export interface KnowledgeChunk {
  recordId: string;
  chunkIndex: number;
  text: string;
  version: string;
  title: string;
  category: string;
  source: string;
  general?: boolean;
}

const MAX_CHARS = 900;
const OVERLAP_CHARS = 120;

/** Cleans whitespace and invisible control characters before indexing. */
export function normalizeText(text: string): string {
  return String(text)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function textVersion(text: string): string {
  return createHash("sha256").update(normalizeText(text)).digest("hex").slice(0, 16);
}

/** Splits long text into overlapping sentence-aware chunks. */
export function chunkText(text: string, maxChars = MAX_CHARS, overlap = OVERLAP_CHARS): string[] {
  const clean = normalizeText(text);
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  const sentences = clean.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [clean];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence.trim()}` : sentence.trim();
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) {
      chunks.push(current);
      const tail = current.slice(-overlap);
      current = `${tail} ${sentence.trim()}`.trim();
    } else {
      chunks.push(sentence.trim().slice(0, maxChars));
      current = sentence.trim().slice(maxChars - overlap);
    }
  }
  if (current) chunks.push(current);

  return chunks.map((chunk) => chunk.trim()).filter(Boolean);
}

/** Converts knowledge records into deduplicated, embeddable chunks. */
export function chunkRecords(records: KnowledgeRecord[]): KnowledgeChunk[] {
  const seen = new Set<string>();
  const chunks: KnowledgeChunk[] = [];

  for (const record of records) {
    const text = normalizeText(`${record.title}. ${record.keywords.join(", ")}. ${record.content}`);
    const pieces = chunkText(text);
    pieces.forEach((piece, index) => {
      const version = textVersion(piece);
      // Prevent duplicate chunks from identical or near-identical sources.
      if (seen.has(version)) return;
      seen.add(version);
      chunks.push({
        recordId: record.id,
        chunkIndex: index,
        text: piece,
        version,
        title: record.title,
        category: record.category,
        source: record.source,
        general: record.general
      });
    });
  }

  return chunks;
}
