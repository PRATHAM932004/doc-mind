import pdf from 'pdf-parse';
import { ExtractedDocument } from '@/types/document';
import { cleanText } from './clean';

/**
 * Extracts raw text from a PDF document buffer.
 */
export async function extractPdf(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const data = await pdf(buffer);
    
    // Sanitize and clean the extracted text
    const text = cleanText(data.text);

    return {
      text,
      metadata: {
        totalPages: data.numpages,
        info: data.info,
      },
    };
  } catch (error: any) {
    console.error('Error in PDF extraction:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}
