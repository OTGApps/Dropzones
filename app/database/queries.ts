import type * as SQLite from "expo-sqlite"
import type { Dropzone, DropzoneRow, StateGroup, AircraftSection } from "./types"

/**
 * Wraps a query function with timing logs.
 */
function withTiming<T>(queryName: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now()
  return fn().then((result) => {
    const elapsed = Date.now() - start
    console.log(`[DB Query] ${queryName} completed in ${elapsed}ms`)
    return result
  })
}

/**
 * Transforms a database row into a Dropzone object.
 * Parses JSON array fields and restructures coordinates.
 */
function rowToDropzone(row: DropzoneRow): Dropzone {
  return {
    anchor: row.anchor,
    name: row.name,
    email: row.email,
    description: row.description,
    phone: row.phone,
    website: row.website,
    aircraft: JSON.parse(row.aircraft),
    location: JSON.parse(row.location),
    services: JSON.parse(row.services),
    training: JSON.parse(row.training),
    coordinates: {
      latitude: row.latitude,
      longitude: row.longitude,
    },
    airport: row.airport,
    country: row.country,
    state: row.state,
    stateCode: row.state_code,
    nameFirstLetter: row.name_first_letter,
    searchableText: row.searchable_text,
  }
}

/**
 * Fetches a single dropzone by its anchor ID.
 */
export async function getDropzoneById(
  db: SQLite.SQLiteDatabase,
  anchor: number,
): Promise<Dropzone | null> {
  return withTiming(`getDropzoneById(${anchor})`, async () => {
    const row = await db.getFirstAsync<DropzoneRow>(
      "SELECT * FROM dropzones WHERE anchor = ?",
      anchor,
    )
    return row ? rowToDropzone(row) : null
  })
}

/**
 * Fetches all dropzones ordered by name.
 */
export async function getAllDropzones(db: SQLite.SQLiteDatabase): Promise<Dropzone[]> {
  return withTiming("getAllDropzones", async () => {
    const rows = await db.getAllAsync<DropzoneRow>("SELECT * FROM dropzones ORDER BY name")
    return rows.map(rowToDropzone)
  })
}

/**
 * Gets dropzone counts grouped by state.
 * States are sorted with 2-letter codes first, then "International" last.
 */
export async function getDropzonesByState(db: SQLite.SQLiteDatabase): Promise<StateGroup[]> {
  return withTiming("getDropzonesByState", async () => {
    const rows = await db.getAllAsync<{ state_code: string; count: number }>(`
      SELECT state_code, COUNT(*) as count
      FROM dropzones
      GROUP BY state_code
      ORDER BY
        CASE WHEN LENGTH(state_code) > 2 THEN 1 ELSE 0 END,
        state_code
    `)
    return rows.map((row) => ({
      stateCode: row.state_code,
      count: row.count,
    }))
  })
}

/**
 * Gets all dropzones grouped by state (returns full dropzone objects).
 */
export async function getDropzonesGroupedByState(
  db: SQLite.SQLiteDatabase,
): Promise<Record<string, Dropzone[]>> {
  const dropzones = await getAllDropzones(db)
  const grouped: Record<string, Dropzone[]> = {}

  for (const dz of dropzones) {
    if (!grouped[dz.stateCode]) {
      grouped[dz.stateCode] = []
    }
    grouped[dz.stateCode].push(dz)
  }

  return grouped
}

/**
 * Normalizes an aircraft name by removing leading numbers and trailing 's'.
 * This should match the normalization logic in getUniqueAircraftSorted.
 */
function normalizeAircraftName(name: string): string {
  let normalized = name
  // Remove leading numbers (e.g., "2 Cessna 182" -> "Cessna 182")
  if (normalized.match(/^\d+ /)) {
    normalized = normalized.substring(normalized.indexOf(" ") + 1)
  }
  // Remove trailing 's' for plurals
  if (normalized.endsWith("s") && normalized.length > 1) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

/**
 * Filters dropzones by a specific criteria.
 */
export async function getFilteredDropzones(
  db: SQLite.SQLiteDatabase,
  itemType: "state" | "aircraft" | "services" | "training",
  item: string,
): Promise<Dropzone[]> {
  return withTiming(`getFilteredDropzones(${itemType}="${item}")`, async () => {
    let query: string
    let params: (string | number)[]

    if (itemType === "state") {
      if (item.toLowerCase() === "international") {
        // For international, get all dropzones that are NOT US states/territories
        // US states are 2-letter codes: AL, AK, AZ, etc.
        // US territories: PR, USVI
        const usStateCodes = [
          "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga",
          "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md",
          "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
          "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "pr", "ri",
          "sc", "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi",
          "wy", "usvi"
        ]
        const placeholders = usStateCodes.map(() => "?").join(",")
        query = `SELECT * FROM dropzones WHERE LOWER(state_code) NOT IN (${placeholders}) ORDER BY name`
        params = usStateCodes
      } else {
        // Exact match for state
        query = "SELECT * FROM dropzones WHERE state_code = ? ORDER BY name"
        params = [item]
      }
      const rows = await db.getAllAsync<DropzoneRow>(query, ...params)
      return rows.map(rowToDropzone)
    } else if (itemType === "aircraft") {
      // For aircraft, we need to use the same normalization logic as the counting
      // to ensure the counts match the filtered results
      const allRows = await db.getAllAsync<DropzoneRow>("SELECT * FROM dropzones ORDER BY name")
      const normalizedSearchTerm = item.toLowerCase()

      const matchingDropzones = allRows.filter((row) => {
        const aircraftList: string[] = JSON.parse(row.aircraft)
        return aircraftList.some((plane) => {
          const normalized = normalizeAircraftName(plane)
          return normalized.toLowerCase() === normalizedSearchTerm
        })
      })

      return matchingDropzones.map(rowToDropzone)
    } else {
      // For services and training, use the original logic
      query = `
        SELECT DISTINCT d.* FROM dropzones d
        WHERE EXISTS (
          SELECT 1 FROM json_each(d.${itemType})
          WHERE json_each.value = ? OR json_each.value LIKE ?
        )
        ORDER BY d.name
      `
      params = [item, `%${item}%`]
      const rows = await db.getAllAsync<DropzoneRow>(query, ...params)
      return rows.map(rowToDropzone)
    }
  })
}

/**
 * Gets all unique aircraft names, normalized (removes count prefixes and plurals).
 */
export async function getUniqueAircraft(db: SQLite.SQLiteDatabase): Promise<string[]> {
  return withTiming("getUniqueAircraft", async () => {
    const rows = await db.getAllAsync<{ aircraft: string }>("SELECT aircraft FROM dropzones")

    const aircraftSet = new Set<string>()

    for (const row of rows) {
      const aircraftList: string[] = JSON.parse(row.aircraft)
      for (const plane of aircraftList) {
        // Remove leading numbers (e.g., "2 Cessna 182" -> "Cessna 182")
        let normalized = plane
        if (plane.match(/^\d+ /)) {
          normalized = plane.substring(plane.indexOf(" ") + 1)
        }
        // Remove trailing 's' for plurals
        if (normalized.endsWith("s") && normalized.length > 1) {
          normalized = normalized.slice(0, -1)
        }
        aircraftSet.add(normalized)
      }
    }

    return Array.from(aircraftSet).sort()
  })
}

/**
 * Gets unique aircraft organized into manufacturer sections with counts.
 */
export async function getUniqueAircraftSorted(
  db: SQLite.SQLiteDatabase,
): Promise<AircraftSection[]> {
  return withTiming("getUniqueAircraftSorted", async () => {
    const rows = await db.getAllAsync<{ aircraft: string }>("SELECT aircraft FROM dropzones")

    // Map to store aircraft names and their counts
    const aircraftCounts = new Map<string, number>()

    // Process all aircraft and count occurrences
    for (const row of rows) {
      const aircraftList: string[] = JSON.parse(row.aircraft)
      const normalizedInThisDropzone = new Set<string>()

      for (const plane of aircraftList) {
        // Remove leading numbers (e.g., "2 Cessna 182" -> "Cessna 182")
        let normalized = plane
        if (plane.match(/^\d+ /)) {
          normalized = plane.substring(plane.indexOf(" ") + 1)
        }
        // Remove trailing 's' for plurals
        if (normalized.endsWith("s") && normalized.length > 1) {
          normalized = normalized.slice(0, -1)
        }
        normalizedInThisDropzone.add(normalized)
      }

      // Count each unique aircraft once per dropzone
      for (const aircraft of normalizedInThisDropzone) {
        aircraftCounts.set(aircraft, (aircraftCounts.get(aircraft) || 0) + 1)
      }
    }

    // Convert to array with counts
    const allAircraft = Array.from(aircraftCounts.entries()).map(([name, count]) => ({
      name,
      count,
    }))

    const remaining = [...allAircraft]

    const removeMatching = (
      predicate: (a: { name: string; count: number }) => boolean,
    ): Array<{ name: string; count: number }> => {
      const matched: Array<{ name: string; count: number }> = []
      for (let i = remaining.length - 1; i >= 0; i--) {
        if (predicate(remaining[i])) {
          matched.push(remaining[i])
          remaining.splice(i, 1)
        }
      }
      return matched.sort((a, b) => a.name.localeCompare(b.name))
    }

    return [
      {
        title: "Antonov",
        data: removeMatching((a) => a.name.toLowerCase().includes("antonov")),
      },
      {
        title: "Atlas",
        data: removeMatching((a) => a.name.toLowerCase().includes("atlas")),
      },
      {
        title: "Beech",
        data: [
          ...removeMatching((a) => a.name.toLowerCase().includes("beech")),
          ...removeMatching((a) => a.name.toLowerCase().includes("king air")),
        ].sort((a, b) => a.name.localeCompare(b.name)),
      },
      {
        title: "de Havilland",
        data: removeMatching((a) => a.name.toLowerCase().includes("otter")),
      },
      {
        title: "Douglas",
        data: [
          ...removeMatching((a) => a.name.toLowerCase().includes("dc3")),
          ...removeMatching((a) => a.name.toLowerCase().includes("dc9")),
          ...removeMatching((a) => a.name.toLowerCase().includes("dc-3")),
          ...removeMatching((a) => a.name.toLowerCase().includes("dc-9")),
        ].sort((a, b) => a.name.localeCompare(b.name)),
      },
      {
        title: "Cessna",
        data: removeMatching((a) => a.name.toLowerCase().includes("cessna")),
      },
      {
        title: "PAC",
        data: removeMatching((a) => a.name.toLowerCase().includes("pac")),
      },
      {
        title: "Pilatus",
        data: removeMatching((a) => a.name.toLowerCase().includes("pilatus")),
      },
      {
        title: "Piper",
        data: removeMatching((a) => a.name.toLowerCase().includes("piper")),
      },
      {
        title: "Other",
        data: remaining.sort((a, b) => a.name.localeCompare(b.name)),
      },
    ].filter((section) => section.data.length > 0)
  })
}

/**
 * Gets all unique service names.
 */
export async function getUniqueServices(db: SQLite.SQLiteDatabase): Promise<string[]> {
  return withTiming("getUniqueServices", async () => {
    const rows = await db.getAllAsync<{ value: string }>(`
      SELECT DISTINCT value
      FROM dropzones, json_each(services)
      ORDER BY value
    `)
    return rows.map((r) => r.value)
  })
}

/**
 * Gets all unique training types.
 */
export async function getUniqueTraining(db: SQLite.SQLiteDatabase): Promise<string[]> {
  return withTiming("getUniqueTraining", async () => {
    const rows = await db.getAllAsync<{ value: string }>(`
      SELECT DISTINCT value
      FROM dropzones, json_each(training)
      ORDER BY value
    `)
    return rows.map((r) => r.value)
  })
}

/**
 * Searches dropzones by text query.
 * Searches in name, description, and website.
 */
export async function searchDropzones(
  db: SQLite.SQLiteDatabase,
  query: string,
): Promise<Dropzone[]> {
  return withTiming(`searchDropzones("${query}")`, async () => {
    const searchTerm = `%${query.toLowerCase()}%`
    const rows = await db.getAllAsync<DropzoneRow>(
      "SELECT * FROM dropzones WHERE searchable_text LIKE ? ORDER BY name",
      searchTerm,
    )
    return rows.map(rowToDropzone)
  })
}
