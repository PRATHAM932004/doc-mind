import prisma from '../prisma';
import { generateEmbedding } from '../embeddings/generate';
import { SearchResult } from '@/types/chat';

/**
 * Searches the pgvector database for chunks that are semantically similar to the search query.
 */
export async function searchSimilarChunks(
  query: string,
  options: { topK?: number } = {}
): Promise<SearchResult[]> {
  const topK = options.topK ?? 5;

  try {
    // Generate the embedding vector for the search query
    const queryEmbedding = await generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    // Query DocumentChunks based on pgvector cosine similarity
    const results = await prisma.$queryRawUnsafe<SearchResult[]>(
      `SELECT
        dc.id,
        dc."documentId",
        dc.content,
        dc."chunkIndex",
        dc."tokenCount",
        d.name AS "documentName",
        1 - (dc.embedding <=> cast($1 as vector)) AS similarity
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d.id
      WHERE dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> cast($1 as vector)
      LIMIT $2;`,
      embeddingStr,
      topK
    );

    return results;
  } catch (error: any) {
    console.error('Error in searchSimilarChunks service:', error);
    throw new Error(`Failed to perform vector similarity search: ${error.message}`);
  }
}
