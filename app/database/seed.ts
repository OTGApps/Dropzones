import type * as SQLite from "expo-sqlite"
import { lookUp } from "geojson-places"

// Import the dropzone data
const dropzoneData = require("../models/root-store/dropzones.json")

interface GeoJSONFeature {
  properties: {
    anchor: number
    name: string
    email: string
    description?: string
    phone?: string
    website?: string
    aircraft?: string[]
    location?: string[]
    services?: string[]
    training?: string[]
  }
  geometry: {
    coordinates: [number, number] // [longitude, latitude]
  }
}

/**
 * Computes the state code from coordinates using geojson-places.
 * Returns "International" for non-US locations.
 */
function computeStateCode(latitude: number, longitude: number, name: string): string {
  const result = lookUp(latitude, longitude)

  if (result?.state_code?.startsWith("US-")) {
    return result.state_code.substring(3)
  }

  // Special case for Key West which sometimes doesn't geocode correctly
  if (name.toLowerCase().endsWith("key west")) {
    return "FL"
  }

  return "International"
}

/**
 * Seeds the database with dropzone data from the JSON file.
 * Only runs if the database is empty.
 */
export async function seedDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  // Check if already seeded
  const countResult = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM dropzones",
  )

  if (countResult && countResult.count > 0) {
    console.log(`Database already seeded with ${countResult.count} dropzones`)
    return
  }

  console.log("Seeding database with dropzone data...")
  const startTime = Date.now()

  const features = dropzoneData.features as GeoJSONFeature[]

  // Use a transaction for better performance
  await db.withTransactionAsync(async () => {
    for (const feature of features) {
      const props = feature.properties
      const [longitude, latitude] = feature.geometry.coordinates

      // Pre-compute derived fields
      const stateCode = computeStateCode(latitude, longitude, props.name)
      const nameFirstLetter = props.name[0].toUpperCase()
      const searchableText = [props.name, props.description || "", props.website || ""]
        .join(" ")
        .toLowerCase()

      await db.runAsync(
        `INSERT INTO dropzones (
          anchor, name, email, description, phone, website,
          aircraft, location, services, training,
          latitude, longitude, state_code, name_first_letter, searchable_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        props.anchor,
        props.name,
        props.email || "",
        props.description || "",
        props.phone || "",
        props.website || "",
        JSON.stringify(props.aircraft || []),
        JSON.stringify(props.location || []),
        JSON.stringify(props.services || []),
        JSON.stringify(props.training || []),
        latitude,
        longitude,
        stateCode,
        nameFirstLetter,
        searchableText,
      )
    }
  })

  const elapsed = Date.now() - startTime
  console.log(`Database seeded with ${features.length} dropzones in ${elapsed}ms`)
}
