export interface SearchResult {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  documentName: string;
  similarity: number;
}

export interface SourceCitation {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content?: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceCitation[];
}
