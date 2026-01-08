#!/usr/bin/env tsx

/**
 * Sort GeoJSON Features by Anchor Property
 *
 * This script reads the dropzones GeoJSON file and sorts all features by their
 * "anchor" property in ascending order. This helps maintain a consistent ordering
 * and makes it easier to find duplicates or merge updates.
 *
 * @file scripts/sort-geojson.ts
 * @description Sorts GeoJSON features by anchor ID
 *
 * Usage:
 *   pnpm dlx tsx scripts/sort-geojson.ts
 *   # or
 *   node --loader ts-node/esm scripts/sort-geojson.ts
 *
 * Example output:
 *   Reading GeoJSON file...
 *   Found 313 features
 *   Sorting by anchor property...
 *   Writing sorted GeoJSON back to file...
 *   ✓ Done! Features sorted by anchor property
 *   First anchor: 100346
 *   Last anchor: 363048
 *
 * What it does:
 *   1. Reads assets/dropzones.geojson
 *   2. Parses the JSON structure
 *   3. Sorts features array by properties.anchor (numeric sort)
 *   4. Writes the sorted JSON back to the same file
 *   5. Preserves all other properties (type, version, geometry, etc.)
 *
 * Notes:
 *   - The script handles both string and number anchor values
 *   - Sorting is done numerically (not alphabetically)
 *   - The output is formatted with 2-space indentation
 *   - Creates a backup is NOT created - commit your changes first!
 *
 * When to use:
 *   - After importing new dropzone data
 *   - Before committing changes to the GeoJSON file
 *   - When merging data from multiple sources
 *   - To detect duplicate or missing anchor IDs
 */

import * as fs from "fs"
import * as path from "path"

// Path to the GeoJSON file relative to this script
const GEOJSON_PATH = path.join(__dirname, "../assets/dropzones.geojson")

/**
 * GeoJSON Feature with dropzone properties
 */
interface GeoJSONFeature {
  type: "Feature"
  properties: {
    anchor: number | string
    name?: string
    [key: string]: any
  }
  geometry: any
}

/**
 * GeoJSON FeatureCollection structure
 */
interface GeoJSONCollection {
  type: "FeatureCollection"
  version?: string
  features: GeoJSONFeature[]
}

/**
 * Sorts the GeoJSON features by anchor property
 */
async function sortGeoJSON() {
  console.log("Reading GeoJSON file...")
  const data = fs.readFileSync(GEOJSON_PATH, "utf-8")
  const geojson: GeoJSONCollection = JSON.parse(data)

  console.log(`Found ${geojson.features.length} features`)
  console.log("Sorting by anchor property...")

  // Sort features by anchor (convert to number for proper numeric sorting)
  geojson.features.sort((a, b) => {
    const anchorA =
      typeof a.properties.anchor === "string"
        ? parseInt(a.properties.anchor, 10)
        : a.properties.anchor
    const anchorB =
      typeof b.properties.anchor === "string"
        ? parseInt(b.properties.anchor, 10)
        : b.properties.anchor
    return anchorA - anchorB
  })

  console.log("Writing sorted GeoJSON back to file...")
  // Write with 2-space indentation for readability
  fs.writeFileSync(GEOJSON_PATH, JSON.stringify(geojson, null, 2), "utf-8")

  console.log("✓ Done! Features sorted by anchor property")
  console.log(`First anchor: ${geojson.features[0].properties.anchor}`)
  console.log(`Last anchor: ${geojson.features[geojson.features.length - 1].properties.anchor}`)
}

// Run the script
sortGeoJSON().catch((error) => {
  console.error("Error:", error)
  process.exit(1)
})
