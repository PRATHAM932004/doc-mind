import { ChunkResult } from '@/types/document';

/**
 * Splits text into chunks of approximately chunkSize characters with a specified overlap.
 * Tries to respect heading, paragraph, and sentence boundaries.
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): ChunkResult[] {
  if (!text) return [];

  const chunks: string[] = [];
  const normalizedText = text.replace(/\r\n/g, '\n');

  const paragraphs = normalizedText.split(/\n\n+/);
  let currentChunk = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;

    if (para.length > chunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }

      const sentences = para.split(/(?<=[.!?])\s+/);
      let sentenceChunk = '';

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) continue;

        if (trimmedSentence.length > chunkSize) {
          if (sentenceChunk) {
            chunks.push(sentenceChunk);
            sentenceChunk = '';
          }

          let remaining = trimmedSentence;
          while (remaining.length > 0) {
            const part = remaining.substring(0, chunkSize);
            chunks.push(part);
            
            const advance = chunkSize - overlap;
            if (advance <= 0 || remaining.length <= chunkSize) {
              break;
            }
            remaining = remaining.substring(advance);
          }
        } else {
          if ((sentenceChunk ? sentenceChunk + ' ' + trimmedSentence : trimmedSentence).length > chunkSize) {
            if (sentenceChunk) {
              chunks.push(sentenceChunk);
              const overlapStart = Math.max(0, sentenceChunk.length - overlap);
              sentenceChunk = sentenceChunk.substring(overlapStart).trim() + ' ' + trimmedSentence;
            } else {
              sentenceChunk = trimmedSentence;
            }
          } else {
            sentenceChunk = sentenceChunk ? sentenceChunk + ' ' + trimmedSentence : trimmedSentence;
          }
        }
      }

      if (sentenceChunk) {
        currentChunk = sentenceChunk;
      }
    } else {
      if ((currentChunk ? currentChunk + '\n\n' + para : para).length > chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk);
          const overlapStart = Math.max(0, currentChunk.length - overlap);
          currentChunk = currentChunk.substring(overlapStart).trim() + '\n\n' + para;
        } else {
          currentChunk = para;
        }
      } else {
        currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.map((content, index) => {
    // Standard heuristic: 1 token is ~4 characters in English
    const tokenCount = Math.ceil(content.length / 4);
    return {
      content,
      chunkIndex: index,
      tokenCount,
    };
  });
}
