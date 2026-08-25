import { z } from 'zod';

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/x-markdown',
];

/**
 * Zod schema to validate document metadata fields.
 */
export const documentUploadSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().positive('File cannot be empty').max(MAX_FILE_SIZE, 'File size cannot exceed 20MB'),
  mimeType: z.string().refine((val) => ALLOWED_MIME_TYPES.includes(val), {
    message: 'Invalid file type. Only PDF, DOCX, TXT, and Markdown files are supported.',
  }),
});

/**
 * Validates a file extension.
 * @param filename The name of the file to check.
 */
export function isValidExtension(filename: string): boolean {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const ext = filename.substring(dotIndex).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}
