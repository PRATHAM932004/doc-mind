import { ExtractedDocument } from '@/types/document';
import { cleanText } from './clean';

/**
 * Extracts text from a plain TXT document buffer (decodes UTF-8).
 */
export async function extractText(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const rawText = buffer.toString('utf-8');
    const text = cleanText(rawText);

    return { text };
  } catch (error: any) {
    console.error('Error in TXT extraction:', error);
    throw new Error(`Failed to extract text from TXT: ${error.message}`);
  }
}
