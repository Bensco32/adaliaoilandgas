import { promises as fs } from "node:fs";
import path from "node:path";
import type { KnowledgeRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DOCUMENTS_FILE = path.join(DATA_DIR, "knowledge-documents.json");

export interface StoredDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  addedAt: string;
}

async function readDocuments(): Promise<StoredDocument[]> {
  try {
    const raw = await fs.readFile(DOCUMENTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (doc): doc is StoredDocument =>
        doc && typeof doc.id === "string" && typeof doc.title === "string" && typeof doc.content === "string" && typeof doc.source === "string"
    );
  } catch {
    return [];
  }
}

export async function loadDynamicDocuments(): Promise<KnowledgeRecord[]> {
  const docs = await readDocuments();
  return docs.map((doc) => ({
    id: `document-${doc.id}`,
    category: "Company Documents",
    title: doc.title,
    content: doc.content,
    source: doc.source,
    keywords: doc.title.toLowerCase().split(/\W+/).filter((word) => word.length > 3),
    updatedAt: doc.addedAt
  }));
}

export async function addDynamicDocument(input: { title: string; content: string; source: string }): Promise<StoredDocument> {
  const docs = await readDocuments();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const doc: StoredDocument = {
    id,
    title: input.title.slice(0, 200),
    content: input.content.slice(0, 20000),
    source: input.source.slice(0, 300),
    addedAt: new Date().toISOString()
  };
  docs.push(doc);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DOCUMENTS_FILE, JSON.stringify(docs, null, 2), "utf8");
  return doc;
}

export async function removeDynamicDocument(id: string): Promise<boolean> {
  const docs = await readDocuments();
  const next = docs.filter((doc) => doc.id !== id);
  if (next.length === docs.length) return false;
  await fs.writeFile(DOCUMENTS_FILE, JSON.stringify(next, null, 2), "utf8");
  return true;
}

export async function countDynamicDocuments(): Promise<number> {
  return (await readDocuments()).length;
}
