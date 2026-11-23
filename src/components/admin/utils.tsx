/**
 * Client helpers for admin pages:
 * - PUT a section of the settings store via the admin API.
 * - Upload documents via the admin API.
 * - Delete entries / toggle enquiry read state.
 */
export interface AdminResult<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

export interface UploadedFile {
  path: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
}

export async function adminPut(section: string, data: unknown): Promise<AdminResult<{ ok: boolean }>> {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, data })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json.error || `Save failed (${res.status}).` };
  return { ok: true, data: { ok: true } };
}

export async function adminUpload(files: File[]): Promise<AdminResult<UploadedFile[]>> {
  const form = new FormData();
  for (const file of files) {
    if (file && file.size > 0) form.append("files", file);
  }
  const res = await fetch("/api/admin/documents", { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json.error || `Upload failed (${res.status}).` };
  return { ok: true, data: json.files as UploadedFile[] };
}

export async function adminDelete(section: "enquiries" | "compliance", id: string): Promise<AdminResult> {
  const res = await fetch(`/api/admin/settings?section=${encodeURIComponent(section)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json.error || `Delete failed (${res.status}).` };
  return { ok: true, data: { ok: true } };
}

export async function adminMarkEnquiryRead(id: string): Promise<AdminResult> {
  const res = await fetch(`/api/admin/settings?action=mark_read&section=enquiries&id=${encodeURIComponent(id)}`, { method: "POST" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: json.error || `Update failed (${res.status}).` };
  return { ok: true, data: { ok: true } };
}

export function dateInputValue(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
