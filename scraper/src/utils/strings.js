/**
 * Titleize a string (capitalize each word) with optional exclusions
 * @param {string} str
 * @param {string[]} exclude - Words to exclude from capitalization
 * @returns {string}
 */
export function titleize(str, exclude = []) {
  const excludeLower = exclude.map((e) => e.toLowerCase())
  return str
    .split(/(\W)/)
    .map((word) => {
      if (excludeLower.includes(word.toLowerCase())) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join("")
}

/**
 * Normalize whitespace in a string
 * @param {string} str
 * @returns {string}
 */
export function normalizeWhitespace(str) {
  return str.replace(/\s+/g, " ").trim()
}
