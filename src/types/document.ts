export interface ExtractedDocument {
  text: string;
  metadata?: Record<string, any>;
}

export type DocumentStatus = 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ChunkResult {
  content: string;
  chunkIndex: number;
  tokenCount: number;
}

export interface DocumentInfo {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}
