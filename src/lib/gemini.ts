import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY environment variable is not defined.');
}

// Reusable modern Gemini Client from the @google/genai SDK
export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    apiVersion: 'v1',
  },
});
