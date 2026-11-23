/**
 * Secure file upload helpers (server-only).
 *
 * - Size and MIME allowlists.
 * - Extensions are allowlisted (no path-traversal tokens).
 * - Files are written to `data/documents/` with a generated filename and are
 *   served back through `GET /documents/:slug`, which re-validates the slug.
 * - Pure helpers live in `src/lib/fileTypes.ts` so the public supplier form
 *   can use them without pulling in Node modules.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR } from "@/lib/settings";
import { extensionOf, sanitizeFileName } from "@/lib/fileTypes";

export const DOCUMENTS_DIR =
  process.env.ADALIA_DOCUMENTS_DIR?.trim() || path.join(DATA_DIR, "documents");

export { extensionOf, sanitizeFileName, isDocumentAllowed } from "@/lib/fileTypes";

export interface UploadedFile {
  originalName: string;
  extension: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Store a validated UploadFile and return the public URL path.
 */
export async function storeUpload(file: File): Promise<UploadedFile> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionOf(file.name);
  if (!ext) throw new Error("File type is not allowed.");
  if (buffer.length > 10 * 1024 * 1024) throw new Error("File is too large.");
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
  const id = crypto.randomUUID();
  const storedName = `${id}.${ext}`;
  const storedPath = path.join(DOCUMENTS_DIR, storedName);
  fs.writeFileSync(storedPath, buffer);
  return {
    originalName: sanitizeFileName(file.name),
    extension: ext,
    path: `/documents/${storedName}`,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: buffer.length
  };
}

export interface SlugValidation {
  ok: boolean;
  filePath: string | null;
}

export function validateDocumentSlug(slug: string): SlugValidation {
  const match = slug.match(/^[0-9a-f-]{36}\.(pdf|png|jpg|jpeg|gif|webp|bmp|txt|doc|docx|xls|xlsx|ppt|pptx)$/i);
  if (!match) return { ok: false, filePath: null };
  const filePath = path.join(DOCUMENTS_DIR, slug);
  const normalised = path.normalize(filePath);
  if (!normalised.startsWith(path.normalize(DOCUMENTS_DIR) + path.sep)) return { ok: false, filePath: null };
  if (!fs.existsSync(normalised) || !fs.statSync(normalised).isFile()) return { ok: false, filePath: null };
  return { ok: true, filePath: normalised };
}

export function listStoredDocuments(): string[] {
  try {
    return fs.readdirSync(DOCUMENTS_DIR).sort();
  } catch {
    return [];
  }
}
