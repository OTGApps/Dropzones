/**
 * Compute the next output version string in YYYY.MM.DD.N format.
 * Same day as the previous version -> increment N. Different day or no
 * usable previous version -> N resets to 1.
 * @param {string} todayStr - Today's date as "YYYY.MM.DD"
 * @param {string} [prevVersion] - Previous version string, e.g. "2026.01.07.3"
 * @returns {string}
 */
export function nextVersion(todayStr, prevVersion) {
  const match = /^(\d{4}\.\d{2}\.\d{2})\.(\d+)$/.exec(prevVersion ?? "")

  if (match && match[1] === todayStr) {
    return `${todayStr}.${parseInt(match[2], 10) + 1}`
  }

  return `${todayStr}.1`
}
