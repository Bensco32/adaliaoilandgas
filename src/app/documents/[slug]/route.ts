/**
 * Public document server.
 * Serves uploaded files (certificates, HSE policies, governance docs, project
 * photos) stored under `data/documents`. Slugs are generated UUIDs; the route
 * re-validates extension, path containment and file existence, and forces
 * download disposition. Files are never listed and never cached by browsers.
 */
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { validateDocumentSlug, DOCUMENTS_DIR } from "@/lib/secureUpload";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  txt: "text/plain; charset=utf-8",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
};

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const validated = validateDocumentSlug(slug);
  if (!validated.ok || !validated.filePath) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const filePath = validated.filePath;
  if (!fs.realpathSync(filePath).startsWith(path.resolve(DOCUMENTS_DIR) + path.sep)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const stat = fs.statSync(filePath);
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
  const res = new NextResponse(fs.readFileSync(filePath));
  res.headers.set("content-type", contentType);
  res.headers.set("content-length", String(stat.size));
  res.headers.set("content-disposition", `attachment; filename="${encodeURIComponent(slug)}"`);
  res.headers.set("cache-control", "no-store");
  res.headers.set("x-content-type-options", "nosniff");
  return res;
}
