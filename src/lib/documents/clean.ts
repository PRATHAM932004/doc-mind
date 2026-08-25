/**
 * Cleans and sanitizes raw text extracted from documents, fixing PDF garble,
 * weird ligatures, hyphenated wraps, and literal escape strings.
 */
export function cleanText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Convert literal backslash-n string representations to real newlines
  cleaned = cleaned.replace(/\\n/g, '\n');

  // 2. Normalize carriage returns
  cleaned = cleaned.replace(/\r\n/g, '\n');

  // 3. Fix common PDF bullet character extraction artifacts
  // Replaces start-of-line garble like "sn", "pl", "]l", "]1" followed by a capital letter with clean list bullet points
  cleaned = cleaned.replace(/(?:^|\n)sn([A-Z])/g, '\n- $1');
  cleaned = cleaned.replace(/(?:^|\n)pl([A-Z])/g, '\n- $1');
  cleaned = cleaned.replace(/(?:^|\n)\]l([A-Z])/g, '\n- $1');
  cleaned = cleaned.replace(/(?:^|\n)\]1([A-Z])/g, '\n- $1');

  // 4. Remove weird stray carets commonly appended to paragraph ends (e.g. "application^")
  cleaned = cleaned.replace(/\^/g, '');

  // 5. Rejoin hyphenated words split across lines (e.g. "in-\nformation" -> "information")
  cleaned = cleaned.replace(/(\w+)-\n(\w+)/g, '$1$2');

  // 6. Collapse excessive consecutive newlines (3 or more) to standard double newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 7. Collapse multiple consecutive horizontal spaces to a single space
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  return cleaned.trim();
}
