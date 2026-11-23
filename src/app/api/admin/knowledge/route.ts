import { NextResponse } from "next/server";
import { ensureEmbeddings, ensureIndexAsync, indexStatus, rebuildEmbeddings, refreshIndex, semanticSearch } from "@/lib/knowledge/retrieval";
import { addDynamicDocument, removeDynamicDocument } from "@/lib/knowledge/store";
import { getSession, getSessionFromRequest } from "@/lib/adminAuth";
import { checkOrigin } from "@/lib/csrf";

/**
 * Protected knowledge-management endpoint.
 * Accepts the admin session cookie (new) or the legacy bearer token.
 */
function authorized(req: Request): boolean {
  const header = req.headers.get("authorization") || "";
  const token = process.env.ADMIN_KNOWLEDGE_TOKEN;
  if (token && header === `Bearer ${token}`) return true;
  return Boolean(getSession(getSessionFromRequest(req)));
}

function disabled() {
  return NextResponse.json(
    { error: "Knowledge management is not configured. Set ADMIN_KNOWLEDGE_TOKEN in the server environment." },
    { status: 503 }
  );
}

export async function GET(req: Request) {
  if (!authorized(req)) return disabled();
  await ensureIndexAsync();
  await ensureEmbeddings();
  return NextResponse.json({ status: await indexStatus() });
}

export async function POST(req: Request) {
  if (!authorized(req)) return disabled();

  try {
    const body = await req.json().catch(() => null);
    const action = typeof body?.action === "string" ? body.action : "";

    if (action === "rebuild" || action === "sync" || action === "reindex") {
      await refreshIndex();
      await ensureEmbeddings();
      return NextResponse.json({
        success: true,
        action,
        status: await indexStatus()
      });
    }

    if (action === "rebuild-embeddings") {
      const status = await rebuildEmbeddings({ force: body?.force === true });
      return NextResponse.json({ success: true, action, status });
    }

    if (action === "retry-failed") {
      const status = await rebuildEmbeddings({ retryFailed: true });
      return NextResponse.json({ success: true, action, status });
    }

    if (action === "test-search") {
      const question = typeof body?.question === "string" ? body.question.trim() : "";
      if (!question) return NextResponse.json({ error: "question is required." }, { status: 400 });
      return NextResponse.json({ success: true, search: await semanticSearch(question) });
    }

    if (action === "add-document") {
      const title = typeof body?.title === "string" ? body.title.trim() : "";
      const content = typeof body?.content === "string" ? body.content.trim() : "";
      const source = typeof body?.source === "string" ? body.source.trim() : "Company document";
      if (!title || !content) {
        return NextResponse.json({ error: "title and content are required." }, { status: 400 });
      }
      const document = await addDynamicDocument({ title, content, source });
      await refreshIndex();
      await ensureEmbeddings();
      return NextResponse.json({ success: true, document, status: await indexStatus() });
    }

    if (action === "remove-document") {
      const id = typeof body?.id === "string" ? body.id : "";
      if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
      const removed = await removeDynamicDocument(id);
      await refreshIndex();
      await ensureEmbeddings();
      return NextResponse.json({ success: removed, status: await indexStatus() });
    }

    return NextResponse.json(
      { error: "Unknown action. Use rebuild, sync, reindex, rebuild-embeddings, retry-failed, test-search, add-document or remove-document." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json({ error: "Knowledge update failed." }, { status: 500 });
  }
}
