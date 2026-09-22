/**
 * Cleans and sanitizes raw text extracted from documents, fixing PDF garble,
 * weird ligatures, hyphenated wraps, and literal escape strings.
 */
export function cleanText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  cleaned = cleaned.replace(/\\n/g, '\n');
  cleaned = cleaned.replace(/\r\n/g, '\n');

  // Fix common PDF bullet character extraction artifacts
  cleaned = cleaned.replace(/(?:^|\n)sn([A-Z])/g, '\n- $1');
  cleaned = cleaned.replace(/(?:^|\n)pl([A-Z])/g, '\n- $1');
  cleaned = cleaned.replace(/(?:^|\n)\]l([A-Z])/g, '\n- $1');
  cleaned = cleaned.replace(/(?:^|\n)\]1([A-Z])/g, '\n- $1');

  cleaned = cleaned.replace(/\^/g, '');
  cleaned = cleaned.replace(/(\w+)-\n(\w+)/g, '$1$2');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  return cleaned.trim();
}
