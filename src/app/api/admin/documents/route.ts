/**
 * Admin document upload/list API.
 * - Accepts multipart `files` (or `file`) form fields.
 * - Validates extension and size before storing under `data/documents/`.
 * - Served publicly through `GET /documents/:slug`.
 */
import { NextResponse } from "next/server";
import { checkOrigin } from "@/lib/csrf";
import { requireSession } from "@/lib/adminAuth";
import { isDocumentAllowed, storeUpload, listStoredDocuments, DOCUMENTS_DIR } from "@/lib/secureUpload";
import fs from "node:fs";
import { logActivity } from "@/lib/settings";

export async function POST(req: Request) {
  if (!checkOrigin(req)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!requireSession(req)) return NextResponse.json({ error: "Please log in to access the admin area." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid multipart form data." }, { status: 400 });

  const rawFiles = [...(form.getAll("files") as File[]), ...(form.getAll("file") as File[])];
  const files = rawFiles.filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "No files provided." }, { status: 400 });
  if (files.length > 20) return NextResponse.json({ error: "Too many files." }, { status: 400 });

  const stored = [];
  for (const file of files) {
    const check = isDocumentAllowed(file.name, file.size);
    if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 });
    stored.push(await storeUpload(file));
  }

  const notes = stored.map((s) => ({
    path: s.path,
    originalName: s.originalName,
    sizeBytes: s.sizeBytes,
    mimeType: s.mimeType
  }));

  logActivity("admin_document_upload", `Uploaded ${files.length} document(s).`);
  return NextResponse.json({ ok: true, files: notes });
}

export async function GET() {
  const out = listStoredDocuments().map((name) => {
    const full = pathJoin(DOCUMENTS_DIR, name);
    const size = fs.existsSync(full) ? fs.statSync(full).size : 0;
    return { name, sizeBytes: size, path: `/documents/${name}` };
  });
  return NextResponse.json({ ok: true, documents: out });
}

function pathJoin(a: string, b: string): string {
  return a.replace(/[\\/]+$/, "") + "/" + b.replace(/^[\\/]+/, "");
}
