# Embedding Upgrade Test Report

Generated: 2026-11-18

## Scope

The existing assistant, knowledge base and 26-question suite were preserved. A hosted transformer embedding path was added in front of the original local hashed-feature retrieval.

## Files added / changed

| File | Purpose |
|---|---|
| `src/lib/knowledge/embeddings.ts` | OpenAI-compatible `/v1/embeddings` provider, batching, caching, stats, error handling. |
| `src/lib/knowledge/chunks.ts` | Text cleaning, sentence-aware chunking, version hashes, duplicate removal. |
| `src/lib/knowledge/embedding-store.ts` | On-disk vector cache with model/version tracking and failure records. |
| `src/lib/knowledge/retrieval.ts` | Added hosted semantic retrieval, relevance checks, fallback, admin status/rebuild/test-search. |
| `src/lib/knowledge/types.ts` | Retrieval mode, semantic result and embedding status types. |
| `src/app/api/chat/route.ts` | Uses hosted retrieval when configured; reports `retrieval` mode. |
| `src/app/api/admin/knowledge/route.ts` | Added embedding rebuild/retry/test-search actions. |
| `src/app/admin/knowledge/page.tsx` | Protected admin UI for status and semantic-search inspection. |
| `.env.example`, `README.md`, `.gitignore` | Configuration, costs and deployment documentation. |

## Test 1 — default configuration (no embedding key)

- Endpoint mode: `retrieval=local`, `embeddingModel=null`.
- Existing suite: **26/26 passed** (`docs/assistant-test-report.md`).
- No API calls attempted; no crash.

## Test 2 — hosted provider (mock OpenAI-compatible endpoint)

A local `/v1/embeddings` server was used with `EMBEDDING_API_KEY`, `EMBEDDING_BASE_URL` and `EMBEDDING_MODEL` set on the server only.

| Check | Result |
|---|---|
| Indexed documents | 80 |
| Indexed chunks | 80 |
| Successful embeddings | 80 |
| Failed embeddings | 0 |
| Active retrieval mode | `hosted` |
| Admin semantic search | `mode=hosted`, 5 scored chunks with source pages |
| Top hit for "operational capabilities" | "The four business divisions" (score 0.179) after relevance checks |
| Chat `retrieval` field | `hosted` |
| Embedding API requests | batched (80 chunks in one call), query vectors cached |

Before adding source-relevance guards, an irrelevant "unverified details" record ranked first with low-quality vectors. After the guard, irrelevant "not published" records are excluded unless the question asks about those details, and broad questions favour overview/division sources.

## Test 3 — provider failure fallback

The mock embedding API was stopped and a **new** question was sent.

| Check | Result |
|---|---|
| Chat HTTP status | 200 |
| `retrieval` field | `local` |
| Answer produced from company knowledge | Yes |
| Failed embedding operations recorded | 1 |

This confirms the assistant degrades to the original local system instead of crashing. A repeated question served from the in-memory embedding cache does not call the provider at all.

## Test 4 — build

`npm run build` succeeded with all 21 routes, including the new `/admin/knowledge` page.

## Cost expectations (text-embedding-3-small, Nov 2026)

| Item | Estimate |
|---|---|
| Initial index (80 chunks, ~8-10k tokens) | < $0.01 |
| 1,000 visitor questions (~20 tokens each) | ~$0.0004 |
| Full re-embed after content changes | < $0.01 |
| text-embedding-3-large alternative | 6.5× the above ($0.13/1M) |

Embeddings are input-token only. The dominant cost, if enabled, remains optional chat generation via `OPENAI_MODEL`.

## Required configuration

Set in the **server** environment (`.env.local` locally, hosting provider in production):

```
EMBEDDING_API_KEY=...      # or rely on OPENAI_API_KEY
EMBEDDING_MODEL=text-embedding-3-small
ADMIN_KNOWLEDGE_TOKEN=...  # to unlock /api/admin/knowledge and /admin/knowledge
```

No keys or tokens are exposed to frontend JavaScript.
