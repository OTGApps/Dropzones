/**
 * Lowercases text and joins its words with hyphens, for stable testIDs.
 */
export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-")
}
