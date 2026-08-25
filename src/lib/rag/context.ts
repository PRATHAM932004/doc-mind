import { SearchResult } from '@/types/chat';

/**
 * Builds a structured text context block from similarity search results.
 */
export function buildRagContext(chunks: SearchResult[]): string {
  if (!chunks || chunks.length === 0) {
    return 'No relevant documents or information found in the company knowledge base.';
  }

  return chunks
    .map((chunk) => {
      const similarityPercentage = (chunk.similarity * 100).toFixed(1);
      return `SOURCE: ${chunk.documentName} (Chunk #${chunk.chunkIndex}, Similarity: ${similarityPercentage}%)\n--------------------------------------------------\n${chunk.content}`;
    })
    .join('\n\n');
}
