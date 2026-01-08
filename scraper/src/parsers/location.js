import { normalizeWhitespace } from "../utils/strings.js"

/**
 * Parse latitude and longitude from a Cheerio page object
 * Extracts coordinates from Google Maps links
 * @param {import('cheerio').CheerioAPI} $ - Cheerio instance
 * @param {import('cheerio').Cheerio} page - Page element to search
 * @returns {number[]} - [latitude, longitude] as floats
 */
export function parseLatLng($, page) {
  // Find all links and filter for Google Maps
  const links = []
  page.find("a").each((_, el) => {
    const href = $(el).attr("href")
    if (href) links.push(href)
  })

  const googleLinks = links.filter((link) => link.startsWith("https://www.google.com/maps/place/"))

  if (googleLinks.length === 0) {
    return [0, 0]
  }

  const link = googleLinks[0]

  // Extract coordinates from URL pattern: /@lat,lng
  const coordsPart = link.split("/@")[1]
  if (!coordsPart) {
    return [0, 0]
  }

  let coords = coordsPart.split(",").slice(0, 2)

  // Fix data issues
  coords = coords.map((ll) => ll.replace("30-", "30.").replace("/", ""))

  // Manual fixes for specific dropzones with incorrect coordinates
  if (coords[1] === "-6.655726") {
    // Crystal Coast Skydiving - fix longitude
    coords = ["34.735441", "-76.655726"]
  }
  if (coords[1] === "81.6411") {
    // Upstate Skydiving - add missing negative sign
    coords[1] = "-" + coords[1]
  }
  if (coords[1]?.startsWith("10132")) {
    // Dropzone Thailand - completely wrong coordinates
    coords = ["12.673829014930723", "101.54822818435342"]
  }
  if (coords[0] === "47.087832" && coords[1] === "-39.413680") {
    // DZ Azov - double negative fix
    coords[1] = coords[1].replace("-", "")
  }

  return coords.map(parseFloat)
}

/**
 * Parse location array from page
 * Extracts address lines separated by <br> tags
 * @param {import('cheerio').CheerioAPI} $ - Cheerio instance
 * @param {import('cheerio').Cheerio} page - Page element to search
 * @returns {string[]} - Array of location strings
 */
export function parseLocationArray($, page) {
  const locationArray = []

  // Find the paragraph with location info (after the first <br>)
  const paragraphs = page.find("p")

  if (paragraphs.length > 0) {
    const firstP = paragraphs.first()
    const html = firstP.html()

    if (html) {
      // Split by <br> tags and extract text
      const parts = html.split(/<br\s*\/?>/i)

      for (let i = 1; i < parts.length; i++) {
        // Check if we hit an <i> tag (icon), which means we're past the address
        if (parts[i].includes("<i ")) {
          break
        }

        // Clean the text
        const text = parts[i]
          .replace(/<[^>]*>/g, "") // Remove any HTML tags
          .trim()

        if (text) {
          locationArray.push(normalizeWhitespace(text))
        }
      }
    }
  }

  return locationArray
}
