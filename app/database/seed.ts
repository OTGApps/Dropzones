import type * as SQLite from "expo-sqlite"
import { lookUp } from "geojson-places"

import Config from "../config"

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
 * Checks if the database needs to be reseeded based on version comparison.
 */
async function shouldReseed(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const stored = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM metadata WHERE key = 'data_version'",
  )
  return !stored || stored.value !== Config.dataVersion
}

/**
 * Updates the stored data version in the metadata table.
 */
async function updateDataVersion(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync(
    "INSERT OR REPLACE INTO metadata (key, value) VALUES ('data_version', ?)",
    [Config.dataVersion],
  )
}

/**
 * Inserts all dropzones from the provided features array.
 */
async function insertDropzones(
  db: SQLite.SQLiteDatabase,
  features: GeoJSONFeature[],
): Promise<void> {
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
}

/**
 * Seeds the database with dropzone data from the JSON file.
 * Checks the data version and reseeds if the version has changed.
 */
export async function seedDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  // Check if we need to reseed based on version
  const needsReseed = await shouldReseed(db)

  if (!needsReseed) {
    const countResult = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM dropzones",
    )
    console.log(
      `Database up to date (version ${Config.dataVersion}) with ${countResult?.count || 0} dropzones`,
    )
    return
  }

  console.log(`Seeding database with dropzone data (version ${Config.dataVersion})...`)
  const startTime = Date.now()

  // Clear existing data before reseeding
  await db.runAsync("DELETE FROM dropzones")

  const features = dropzoneData.features as GeoJSONFeature[]
  await insertDropzones(db, features)

  // Update the stored version after successful seeding
  await updateDataVersion(db)

  const elapsed = Date.now() - startTime
  console.log(`Database seeded with ${features.length} dropzones in ${elapsed}ms`)
}

/**
 * Seeds the database with dropzone data from a remote GeoJSON object.
 * Used when applying remote updates.
 */
export async function seedDatabaseFromRemote(
  db: SQLite.SQLiteDatabase,
  remoteData: { version: string; features: GeoJSONFeature[] },
): Promise<void> {
  console.log(`Updating database from remote (version ${remoteData.version})...`)
  const startTime = Date.now()

  // Clear existing data before reseeding
  await db.runAsync("DELETE FROM dropzones")

  await insertDropzones(db, remoteData.features)

  // Store the remote version
  await db.runAsync("INSERT OR REPLACE INTO metadata (key, value) VALUES ('data_version', ?)", [
    remoteData.version,
  ])

  const elapsed = Date.now() - startTime
  console.log(`Database updated with ${remoteData.features.length} dropzones in ${elapsed}ms`)
}
