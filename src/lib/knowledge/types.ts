export interface KnowledgeRecord {
  id: string;
  category: string;
  title: string;
  content: string;
  source: string;
  keywords: string[];
  updatedAt: string;
  /** True for general industry terminology, never presented as a verified company fact. */
  general?: boolean;
}

export interface RetrievalResult {
  record: KnowledgeRecord;
  score: number;
}

export type RetrievalMode = "hosted" | "local";

export interface SemanticSearchResult {
  record: KnowledgeRecord;
  score: number;
  chunkText: string;
  source: string;
  category: string;
}

export interface SemanticSearchResponse {
  question: string;
  mode: RetrievalMode;
  results: SemanticSearchResult[];
  provider: string;
  model: string;
}

export interface EmbeddingStatus {
  provider: string;
  model: string;
  enabled: boolean;
  indexedDocuments: number;
  indexedChunks: number;
  successfulEmbeddings: number;
  failedEmbeddings: number;
  lastSuccessfulIndexingAt: string | null;
  retrievalMode: RetrievalMode;
}

export interface KnowledgeStatus {
  recordCount: number;
  categoryCount: number;
  categories: string[];
  lastIndexedAt: string;
  lastSyncAt: string;
  dynamicDocumentCount: number;
  errors: string[];
  sources: string[];
  embedding: EmbeddingStatus;
}
