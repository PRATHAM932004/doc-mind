import { ExtractedDocument } from '@/types/document';
import { cleanText } from './clean';

/**
 * Extracts text from a Markdown document buffer (decodes UTF-8).
 */
export async function extractMarkdown(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const rawText = buffer.toString('utf-8');
    const text = cleanText(rawText);

    return { text };
  } catch (error: any) {
    console.error('Error in Markdown extraction:', error);
    throw new Error(`Failed to extract text from Markdown: ${error.message}`);
  }
}
