/**
 * Pure, client-safe file validation helpers shared by the public supplier
 * form. Kept free of Node imports.
 */

export const ALLOWED_DOCUMENT_EXTENSIONS = new Set([
  "pdf", "txt", "png", "jpg", "jpeg", "gif", "webp", "bmp", "doc", "docx", "xls", "xlsx", "ppt", "pptx"
]);

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB

export function extensionOf(name: string): string {
  const base = name.split(/[\\/]/).pop()?.toLowerCase() || "";
  const dot = base.lastIndexOf(".");
  if (dot === -1) return "";
  return base.slice(dot + 1);
}

export function isDocumentAllowed(name: string, sizeBytes: number): { ok: true } | { ok: false; reason: string } {
  const ext = extensionOf(name);
  if (!ext || !ALLOWED_DOCUMENT_EXTENSIONS.has(ext)) {
    return { ok: false, reason: `File type "${ext || "unknown"}" is not allowed.` };
  }
  if (sizeBytes > MAX_DOCUMENT_BYTES) {
    return { ok: false, reason: "File is too large (maximum 10 MB)." };
  }
  return { ok: true };
}

export function sanitizeFileName(name: string): string {
  const base = (name.split(/[\\/]/).pop() || "").replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80);
  return base || "upload";
}
