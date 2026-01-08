import type * as SQLite from "expo-sqlite"

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
 * Configuration for batch processing during database seeding.
 * Processing in batches reduces memory pressure and prevents OOM kills.
 * Using smaller batches (25) to ensure memory stays under control on low-end devices.
 */
const BATCH_SIZE = 25 // Insert 25 dropzones per transaction
const GC_DELAY_MS = 200 // Delay between batches to allow garbage collection

/**
 * Normalizes a field that could be a string, array, or undefined into an array.
 */
function normalizeToArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

/**
 * Inserts all dropzones from the provided features array using batch processing.
 * Processing in batches reduces memory consumption and prevents out-of-memory crashes.
 */
async function insertDropzones(
  db: SQLite.SQLiteDatabase,
  features: GeoJSONFeature[],
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const totalFeatures = features.length
  const totalBatches = Math.ceil(totalFeatures / BATCH_SIZE)
  console.log(
    `[DB] Starting to insert ${totalFeatures} dropzones in ${totalBatches} batches (${BATCH_SIZE} per batch)...`,
  )

  const startTime = Date.now()
  let totalSkipped = 0
  let totalInserted = 0

  // Process features in batches
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batchStart = batchIndex * BATCH_SIZE
    const batchEnd = Math.min(batchStart + BATCH_SIZE, totalFeatures)
    const batch = features.slice(batchStart, batchEnd)
    const batchNum = batchIndex + 1

    const batchStartTime = Date.now()
    console.log(
      `[DB] Processing batch ${batchNum}/${totalBatches} (records ${batchStart + 1}-${batchEnd})...`,
    )

    let batchSkipped = 0
    let batchInserted = 0

    try {
      // Process each batch in its own transaction
      await db.withTransactionAsync(async () => {
        for (let i = 0; i < batch.length; i++) {
          const feature = batch[i]
          const props = feature.properties
          const [lon, lat] = feature.geometry?.coordinates || []
          const globalIndex = batchStart + i

          // Skip features without valid coordinates
          if (!lon || !lat) {
            console.warn(`Skipping feature ${props.anchor} (${props.name}) - missing coordinates`)
            batchSkipped++
            continue
          }

          // Ensure coordinates are numbers (remote data may have strings)
          const longitude = typeof lon === "string" ? parseFloat(lon) : lon
          const latitude = typeof lat === "string" ? parseFloat(lat) : lat

          // Skip if coordinates are invalid after parsing
          if (isNaN(longitude) || isNaN(latitude)) {
            console.warn(`Skipping feature ${props.anchor} (${props.name}) - invalid coordinates`)
            batchSkipped++
            continue
          }

          // Pre-compute derived fields
          const stateCode = props.state
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
          const anchor =
            typeof props.anchor === "string" ? parseInt(props.anchor, 10) : props.anchor

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
          batchInserted++

          // Report progress every 2 features or on the last feature
          const currentTotal = totalInserted + batchInserted
          if (onProgress && (i % 2 === 0 || globalIndex === totalFeatures - 1)) {
            onProgress(currentTotal, totalFeatures)
          }
        }
      })

      totalInserted += batchInserted
      totalSkipped += batchSkipped

      const batchElapsed = Date.now() - batchStartTime
      const batchRate = batchInserted > 0 ? (batchInserted / batchElapsed) * 1000 : 0
      console.log(
        `[DB] Batch ${batchNum}/${totalBatches} complete: ${batchInserted} inserted, ${batchSkipped} skipped in ${batchElapsed}ms (${batchRate.toFixed(1)} rows/sec). Total: ${totalInserted}/${totalFeatures}`,
      )

      // Brief delay between batches to allow garbage collection
      // This helps prevent memory accumulation that can lead to OOM crashes
      if (batchEnd < totalFeatures) {
        await new Promise((resolve) => setTimeout(resolve, GC_DELAY_MS))
      }
    } catch (error) {
      console.error(`[DB] Batch ${batchNum}/${totalBatches} failed:`, error)
      throw error
    }
  }

  const totalElapsed = Date.now() - startTime
  const overallRate = totalInserted > 0 ? (totalInserted / totalElapsed) * 1000 : 0
  console.log(
    `[DB] Insert complete: ${totalInserted} inserted, ${totalSkipped} skipped in ${totalElapsed}ms (${overallRate.toFixed(1)} rows/sec)`,
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
