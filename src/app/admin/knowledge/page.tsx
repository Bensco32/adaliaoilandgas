"use client";

import { useEffect, useState } from "react";

type Embedding = {
  provider: string;
  model: string;
  enabled: boolean;
  indexedDocuments: number;
  indexedChunks: number;
  successfulEmbeddings: number;
  failedEmbeddings: number;
  lastSuccessfulIndexingAt: string | null;
  retrievalMode: "hosted" | "local";
};

type Status = {
  recordCount?: number;
  categoryCount?: number;
  sourceCount?: number;
  errors?: Array<{ source?: string; message?: string }>;
  embedding?: Embedding;
};

type SearchHit = {
  record: { title: string; category: string };
  score: number;
  source: string;
  chunkText: string;
};

export default function KnowledgeAdminPage() {
  const [token, setToken] = useState(""); // optional legacy bearer token
  const [status, setStatus] = useState<Status | null>(null);
  const [question, setQuestion] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [searchMode, setSearchMode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function extraHeaders(): Record<string, string> {
    return token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {};
  }

  async function call(action: string | null, body: Record<string, unknown> = {}) {
    setBusy(true);
    setMessage("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json", ...extraHeaders() };
      const res = await fetch("/api/admin/knowledge", {
        method: action ? "POST" : "GET",
        headers,
        ...(action ? { body: JSON.stringify({ action, ...body }) } : {})
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) setMessage("Not authenticated. Log in as an administrator first.");
        else setMessage(data.error || `Request failed (${res.status}).`);
        return;
      }
      if (data.status) setStatus(data.status);
      if (data.search) {
        setHits(data.search.results);
        setSearchMode(`${data.search.mode} · ${data.search.model}`);
      }
      setMessage("Done.");
    } catch {
      setMessage("Could not reach the knowledge service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void call(null);
  }, []);

  const embedding = status?.embedding;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Knowledge &amp; Embedding Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage the verified company knowledge index. The knowledge endpoint requires an administrator session. A legacy bearer token is also supported if configured.
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label className="block text-sm font-medium text-slate-700">Legacy administrator token (optional)</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="ADMIN_KNOWLEDGE_TOKEN"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2"
          />
          <button onClick={() => call(null)} disabled={busy} className="rounded-md bg-navy-900 px-5 py-2 font-semibold text-white disabled:opacity-50">
            Load status
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </div>

      {embedding && (
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-navy-900">Embedding status</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Provider</dt>
              <dd className="font-medium">{embedding.provider}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Model</dt>
              <dd className="font-medium">{embedding.model}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Retrieval mode</dt>
              <dd className="font-medium">{embedding.retrievalMode}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Provider configured</dt>
              <dd className="font-medium">{embedding.enabled ? "Yes" : "No — local fallback"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Indexed documents</dt>
              <dd className="font-medium">{embedding.indexedDocuments}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Indexed chunks</dt>
              <dd className="font-medium">{embedding.indexedChunks}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Successful embeddings</dt>
              <dd className="font-medium">{embedding.successfulEmbeddings}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Failed embeddings</dt>
              <dd className="font-medium">{embedding.failedEmbeddings}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Last successful indexing</dt>
              <dd className="font-medium">{embedding.lastSuccessfulIndexingAt || "Never"}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => call("rebuild-embeddings")} disabled={busy} className="rounded-md bg-gold-500 px-4 py-2 font-semibold text-navy-900 disabled:opacity-50">
              Embed missing chunks
            </button>
            <button onClick={() => call("rebuild-embeddings", { force: true })} disabled={busy} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-navy-900 disabled:opacity-50">
              Rebuild all embeddings
            </button>
            <button onClick={() => call("retry-failed")} disabled={busy} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-navy-900 disabled:opacity-50">
              Retry failed
            </button>
            <button onClick={() => call("reindex")} disabled={busy} className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-navy-900 disabled:opacity-50">
              Re-index sources
            </button>
          </div>
        </section>
      )}

      <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-navy-900">Semantic search test</h2>
        <p className="mt-1 text-sm text-slate-600">See exactly which company knowledge would be retrieved for a question.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. What are the company's operational capabilities?"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2"
          />
          <button onClick={() => call("test-search", { question })} disabled={busy} className="rounded-md bg-navy-900 px-5 py-2 font-semibold text-white disabled:opacity-50">
            Search
          </button>
        </div>
        {hits && (
          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-gold-700">Mode used: {searchMode}</p>
            {hits.length === 0 && <p className="text-sm text-slate-600">No knowledge chunks met the relevance threshold.</p>}
            {hits.map((hit, index) => (
              <div key={index} className="rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-semibold text-navy-900">{hit.record.title}</span>
                  <span className="text-slate-500">score {hit.score.toFixed(3)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{hit.record.category} — {hit.source}</p>
                <p className="mt-2 text-sm text-slate-700">{hit.chunkText}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
