import mammoth from 'mammoth';
import { ExtractedDocument } from '@/types/document';
import { cleanText } from './clean';

/**
 * Extracts raw text from a DOCX document buffer.
 */
export async function extractDocx(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = cleanText(result.value);

    return {
      text,
      metadata: {
        messages: result.messages || [],
      },
    };
  } catch (error: any) {
    console.error('Error in DOCX extraction:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}
