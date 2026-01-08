/**
 * Check if a string represents an integer
 * @param {string} str
 * @returns {boolean}
 */
export function isInteger(str) {
  return /^[-+]?\d+$/.test(str)
}

/**
 * Extract substring between two markers
 * @param {string} str
 * @param {string} marker1
 * @param {string} marker2
 * @returns {string|null}
 */
export function stringBetweenMarkers(str, marker1, marker2) {
  const escapedMarker1 = marker1.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const escapedMarker2 = marker2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`${escapedMarker1}(.*?)${escapedMarker2}`, "s")
  const match = str.match(regex)
  return match ? match[1] : null
}

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
 * Convert string to underscore/snake_case
 * @param {string} str
 * @returns {string}
 */
export function underscore(str) {
  return str
    .replace(/::/g, "/")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase()
}

/**
 * Normalize whitespace in a string
 * @param {string} str
 * @returns {string}
 */
export function normalizeWhitespace(str) {
  return str.replace(/\s+/g, " ").trim()
}
