import { ai } from '../gemini';

function getMockEmbedding(text: string): number[] {
  const vector = new Array(1536).fill(0);
  for (let i = 0; i < 1536; i++) {
    let sum = 0;
    for (let j = 0; j < Math.min(text.length, 100); j++) {
      sum += text.charCodeAt(j) * Math.sin(i + j);
    }
    vector[i] = Math.sin(sum);
  }
  const magnitude = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
  return vector.map((val) => val / (magnitude || 1));
}

/**
 * Generates a 1536-dimensional vector embedding for the given text using Gemini's API.
 * Uses gemini-embedding-001 by default with outputDimensionality configured to 1536.
 * Falls back to a deterministic mock generator if MOCK_AI_SERVICES is enabled or key is missing.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const isMockEnabled = process.env.MOCK_AI_SERVICES === 'true';
  const hasNoKey = !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('mock') || process.env.GEMINI_API_KEY.trim() === '';

  if (isMockEnabled || hasNoKey) {
    console.log('[Embedding] Using mock 1536-dimensional deterministic embedding generator.');
    return getMockEmbedding(text);
  }

  try {
    const rawModelName = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
    const modelName = rawModelName.startsWith('models/') ? rawModelName : `models/${rawModelName}`;

    const sanitizedText = text.replace(/\n/g, ' ');
    const response = await ai.models.embedContent({
      model: modelName,
      contents: sanitizedText,
      config: {
        outputDimensionality: 1536,
      },
    });

    const values = response?.embeddings?.[0]?.values;
    if (!values) {
      throw new Error('Invalid response structure received from Gemini embedding API.');
    }

    return values;
  } catch (error: any) {
    console.error('Error in generateEmbedding service using Gemini:', error);
    console.warn('[Embedding] Gemini Embedding API call failed. Falling back to mock generator.');
    return getMockEmbedding(text);
  }
}
