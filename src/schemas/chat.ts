import { z } from 'zod';

/**
 * Zod schema to validate chat message requests.
 */
export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
});
