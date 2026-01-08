import type * as SQLite from "expo-sqlite"
import { lookUp } from "geojson-places"

// @ts-expect-error - babel-plugin-inline-import handles .geojson files
import dropzoneDataRaw from "../../assets/dropzones.geojson"

// Parse the inlined JSON string
const dropzoneData = JSON.parse(dropzoneDataRaw)

/**
 * Version from the bundled GeoJSON file
 */
export const LOCAL_DATA_VERSION =
  dropzoneData.metadata?.version || dropzoneData.version || "unknown"

interface GeoJSONFeature {
  properties: {
    anchor: number | string
    name: string
    email: string
    description?: string
    phone?: string
    website?: string
    aircraft?: string | string[]
    location?: string | string[]
    services?: string | string[]
    training?: string | string[]
    airport?: string
    country?: string
    state?: string
  }
  geometry: {
    coordinates: [number | string, number | string] // [longitude, latitude]
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
  const startTime = Date.now()
  console.log("[DB] Checking if reseed is needed...")

  // Check stored version
  const versionStart = Date.now()
  const stored = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM metadata WHERE key = 'data_version'",
  )
  console.log(`[DB] Version query took ${Date.now() - versionStart}ms`)
  const storedVersion = stored?.value || "none"
  const localVersion = LOCAL_DATA_VERSION

  // Check if data exists
  const countStart = Date.now()
  const countResult = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM dropzones",
  )
  console.log(`[DB] Count query took ${Date.now() - countStart}ms`)
  const hasData = countResult && countResult.count > 0

  // Reseed if version differs OR if database is empty
  const needsReseed = !stored || stored.value !== localVersion || !hasData

  console.log(
    `[DB] Version check complete in ${Date.now() - startTime}ms: stored="${storedVersion}", local="${localVersion}", hasData=${hasData}, needsReseed=${needsReseed}`,
  )

  return needsReseed
}

/**
 * Updates the stored data version in the metadata table.
 */
async function updateDataVersion(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync("INSERT OR REPLACE INTO metadata (key, value) VALUES ('data_version', ?)", [
    LOCAL_DATA_VERSION,
  ])
}

/**
 * Normalizes a field that could be a string, array, or undefined into an array.
 */
function normalizeToArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

/**
 * Inserts all dropzones from the provided features array.
 */
async function insertDropzones(
  db: SQLite.SQLiteDatabase,
  features: GeoJSONFeature[],
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  console.log(`[DB] Starting to insert ${features.length} dropzones...`)
  const startTime = Date.now()
  let skipped = 0
  let insertCount = 0

  const transactionStart = Date.now()
  await db.withTransactionAsync(async () => {
    console.log(`[DB] Transaction started in ${Date.now() - transactionStart}ms`)
    const batchStart = Date.now()

    for (let index = 0; index < features.length; index++) {
      const feature = features[index]
      const props = feature.properties
      const [lon, lat] = feature.geometry?.coordinates || []

      // Skip features without valid coordinates
      if (!lon || !lat) {
        console.warn(`Skipping feature ${props.anchor} (${props.name}) - missing coordinates`)
        skipped++
        continue
      }

      // Ensure coordinates are numbers (remote data may have strings)
      const longitude = typeof lon === "string" ? parseFloat(lon) : lon
      const latitude = typeof lat === "string" ? parseFloat(lat) : lat

      // Skip if coordinates are invalid after parsing
      if (isNaN(longitude) || isNaN(latitude)) {
        console.warn(`Skipping feature ${props.anchor} (${props.name}) - invalid coordinates`)
        skipped++
        continue
      }

      // Pre-compute derived fields
      const stateCode = computeStateCode(latitude, longitude, props.name)
      const nameFirstLetter = props.name[0].toUpperCase()
      const searchableText = [
        props.name,
        props.description || "",
        props.website || "",
        props.airport || "",
        props.country || "",
      ]
        .join(" ")
        .toLowerCase()

      // Normalize array fields (remote data may have strings instead of arrays)
      const aircraft = normalizeToArray(props.aircraft)
      const location = normalizeToArray(props.location)
      const services = normalizeToArray(props.services)
      const training = normalizeToArray(props.training)

      // Ensure anchor is a number
      const anchor = typeof props.anchor === "string" ? parseInt(props.anchor, 10) : props.anchor

      await db.runAsync(
        `INSERT INTO dropzones (
          anchor, name, email, description, phone, website,
          aircraft, location, services, training,
          latitude, longitude, airport, country, state,
          state_code, name_first_letter, searchable_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        anchor,
        props.name,
        props.email || "",
        props.description || "",
        props.phone || "",
        props.website || "",
        JSON.stringify(aircraft),
        JSON.stringify(location),
        JSON.stringify(services),
        JSON.stringify(training),
        latitude,
        longitude,
        props.airport || "",
        props.country || "",
        props.state || "",
        stateCode,
        nameFirstLetter,
        searchableText,
      )
      insertCount++

      // Report progress every 2 features or on the last feature
      if (onProgress && (index % 2 === 0 || index === features.length - 1)) {
        onProgress(index + 1, features.length)
      }

      // Log progress every 50 inserts
      if (insertCount % 50 === 0) {
        const elapsed = Date.now() - batchStart
        const rate = (insertCount / elapsed) * 1000
        console.log(
          `[DB] Inserted ${insertCount}/${features.length} dropzones (${rate.toFixed(1)} rows/sec)`,
        )
      }
    }
  })

  const elapsed = Date.now() - startTime
  const rate = (insertCount / elapsed) * 1000
  console.log(
    `[DB] Insert complete: ${insertCount} inserted, ${skipped} skipped in ${elapsed}ms (${rate.toFixed(1)} rows/sec)`,
  )
}

/**
 * Seeds the database with dropzone data from the JSON file.
 * Checks the data version and reseeds if the version has changed.
 */
export async function seedDatabase(
  db: SQLite.SQLiteDatabase,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const totalStart = Date.now()

  // Check if we need to reseed based on version or empty database
  const needsReseed = await shouldReseed(db)

  if (!needsReseed) {
    console.log(`[DB] Database up to date (version ${LOCAL_DATA_VERSION})`)
    return
  }

  console.log(`[DB] Seeding database with dropzone data (version ${LOCAL_DATA_VERSION})...`)
  const startTime = Date.now()

  // Clear existing data before reseeding
  const deleteStart = Date.now()
  await db.runAsync("DELETE FROM dropzones")
  console.log(`[DB] Cleared existing data in ${Date.now() - deleteStart}ms`)

  const features = dropzoneData.features as GeoJSONFeature[]
  await insertDropzones(db, features, onProgress)

  // Update the stored version after successful seeding
  const versionStart = Date.now()
  await updateDataVersion(db)
  console.log(`[DB] Updated version metadata in ${Date.now() - versionStart}ms`)

  const elapsed = Date.now() - startTime
  const totalElapsed = Date.now() - totalStart
  console.log(
    `[DB] ✅ Database seeded with ${features.length} dropzones in ${elapsed}ms (total: ${totalElapsed}ms)`,
  )
}

/**
 * Seeds the database with dropzone data from a remote GeoJSON object.
 * Used when applying remote updates.
 */
export async function seedDatabaseFromRemote(
  db: SQLite.SQLiteDatabase,
  remoteData: { version: string; features: GeoJSONFeature[] },
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  console.log(`[DB] Updating database from remote (version ${remoteData.version})...`)
  const startTime = Date.now()

  // Clear existing data before reseeding
  const deleteStart = Date.now()
  await db.runAsync("DELETE FROM dropzones")
  console.log(`[DB] Cleared existing data in ${Date.now() - deleteStart}ms`)

  await insertDropzones(db, remoteData.features, onProgress)

  // Store the remote version
  const versionStart = Date.now()
  await db.runAsync("INSERT OR REPLACE INTO metadata (key, value) VALUES ('data_version', ?)", [
    remoteData.version,
  ])
  console.log(`[DB] Updated version metadata in ${Date.now() - versionStart}ms`)

  const elapsed = Date.now() - startTime
  console.log(
    `[DB] ✅ Database updated with ${remoteData.features.length} dropzones in ${elapsed}ms`,
  )
}
