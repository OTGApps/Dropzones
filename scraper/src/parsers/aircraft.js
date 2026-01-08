import { titleize } from "../utils/strings.js"

/**
 * Parse and normalize aircraft string from USPA website
 * Handles inconsistent data formats and normalizes aircraft names
 * @param {string} aircraft - Raw aircraft string from website
 * @returns {string[]} - Array of normalized aircraft strings
 */
export function parseAircraftString(aircraft) {
  if (!aircraft || aircraft.trim() === "") {
    return []
  }

  // Split by common delimiters
  let normalized = aircraft
    .split(" and/or ")
    .join(", ")
    .split(" Or ")
    .join(", ")
    .split(" & ")
    .join(", ")

  return normalized
    .split(", ")
    .map((a) => {
      // Remove trailing comments/notes after --
      let newA = a.split("--")[0].trim().replace(/,$/, "")

      // Titleize with exclusions for specific aircraft codes
      newA = titleize(newA, ["Ptg-A21", "an-28", "Y-12s", "Mi-8"])

      // Regex replacements
      newA = newA.replace(/C-(\d{3})/g, "Cessna $1")

      // Substitutions
      const substitutions = {
        "1 Short ": "",
        "Antonov-": "Antonov ",
        "Cessna 182e": "Cessna 182",
        "C 172": "Cessna 172",
        "Dc-9": "DC-9",
        "Dc3": "DC-3",
        "Super  Otter": "Super Twin Otter",
        "Cessna 208b": "Cessna 208 Caravan",
        "1 AN-": "1 Antonov ",
        "1 An-": "1 Antonov ",
        "1  1 ": "1 ",
        "Ceena": "Cessna",
        "Cesna": "Cessna",
        " - Ptg-A21 Turbo Prop": "",
        "1 Caravan": "1 Cessna 208 Caravan",
        "Supervan 900": "Supervan",
        "Cessna 208B": "Cessna 208",
        "Cessna Caravan 208": "Cessna 208 Caravan",
        "Cessna172": "Cessna 172",
        "Tbc-2mc": "TBC-2MC",
        "182l": "182",
        "900 Supervan": "Supervan",
        "Cessna Caravans": "Cessna 208 Caravans",
        "Cessna Caravan": "Cessna 208 Caravan",
        " Cessna 208s": " Cessna 208 Caravan",
        " Turbine Aircraft": "",
        "Beech King Air": "King Air",
      }

      for (const [key, value] of Object.entries(substitutions)) {
        newA = newA.split(key).join(value)
      }

      // Whole replacements (exact match, case insensitive)
      const wholeReplacements = {
        "1 208": "1 Cessna 208 Caravan",
        "1 850HP Cessna 208 Caravan": "1 Cessna 208 Super Caravan",
        "1 An-2": "1 AN-2",
        "1 Cessna Caravan": "1 Cessna 208 Caravan",
        "1 Cessna Caravan Supervan": "1 Cessna 208 Supervan",
        "3 Supervans": "3 Cessna 208 Supervans",
        "1  1 Short C23 Sherpa": "1 Short C23 Sherpa",
      }

      for (const [key, value] of Object.entries(wholeReplacements)) {
        if (newA.toLowerCase() === key.toLowerCase()) {
          newA = value
        }
      }

      // If result is an array, return it early
      if (Array.isArray(newA)) {
        return newA
      }

      // Search with whole replacement (contains match)
      const containsReplacements = {
        Blackhawk: "Cessna 208 Caravan Blackhawk",
        Piper: "Piper Navajo PA31",
        Porter: "Pilatus Porter PC-6 B2/H4",
        410: "Let L-410 Turbolet",
      }

      for (const [key, value] of Object.entries(containsReplacements)) {
        if (newA.toLowerCase().includes(key.toLowerCase())) {
          newA = newA[0] + " " + value
        }
      }

      // Fix issues with plurals
      const qty = parseFloat(newA[0]) || 0
      if (qty > 1 && !newA.endsWith("s")) {
        newA += "s"
      }
      if (newA.startsWith("1") && newA.endsWith("s")) {
        newA = newA.slice(0, -1)
      }

      // Make sure they all start with a number
      if (!/^\d /.test(newA) && newA.toLowerCase() !== "varies") {
        newA = "1 " + newA
      }

      return newA
    })
    .flat()
    .filter(Boolean)
}
