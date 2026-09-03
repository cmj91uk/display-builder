/** Characters supported by the letter display template (A–Z, 0–9). */
const DISPLAY_CHAR_PATTERN = /^[A-Z0-9]$/

/**
 * Normalize display text: uppercase, keep only printable letters/digits.
 * Spaces and other characters are dropped (no blank pages for gaps).
 */
export function extractDisplayCharacters(text: string): string[] {
  return [...text.toUpperCase()].filter((char) =>
    DISPLAY_CHAR_PATTERN.test(char),
  )
}

export function isDisplayCharacter(char: string): boolean {
  return DISPLAY_CHAR_PATTERN.test(char.toUpperCase())
}
