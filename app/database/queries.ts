import type * as SQLite from "expo-sqlite"
import type { Dropzone, DropzoneRow, StateGroup, AircraftSection } from "./types"

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
  const row = await db.getFirstAsync<DropzoneRow>(
    "SELECT * FROM dropzones WHERE anchor = ?",
    anchor,
  )
  return row ? rowToDropzone(row) : null
}

/**
 * Fetches all dropzones ordered by name.
 */
export async function getAllDropzones(db: SQLite.SQLiteDatabase): Promise<Dropzone[]> {
  const rows = await db.getAllAsync<DropzoneRow>("SELECT * FROM dropzones ORDER BY name")
  return rows.map(rowToDropzone)
}

/**
 * Gets dropzone counts grouped by state.
 * States are sorted with 2-letter codes first, then "International" last.
 */
export async function getDropzonesByState(db: SQLite.SQLiteDatabase): Promise<StateGroup[]> {
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
 * Filters dropzones by a specific criteria.
 */
export async function getFilteredDropzones(
  db: SQLite.SQLiteDatabase,
  itemType: "state" | "aircraft" | "services" | "training",
  item: string,
): Promise<Dropzone[]> {
  let query: string
  let params: (string | number)[]

  if (itemType === "state") {
    // Exact match for state
    query = "SELECT * FROM dropzones WHERE state_code = ? ORDER BY name"
    params = [item]
  } else {
    // For array fields, check if item exists in the JSON array
    // Using json_each to match both exact and partial matches
    query = `
      SELECT DISTINCT d.* FROM dropzones d
      WHERE EXISTS (
        SELECT 1 FROM json_each(d.${itemType})
        WHERE json_each.value = ? OR json_each.value LIKE ?
      )
      ORDER BY d.name
    `
    params = [item, `%${item}%`]
  }

  const rows = await db.getAllAsync<DropzoneRow>(query, ...params)
  return rows.map(rowToDropzone)
}

/**
 * Gets all unique aircraft names, normalized (removes count prefixes and plurals).
 */
export async function getUniqueAircraft(db: SQLite.SQLiteDatabase): Promise<string[]> {
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
}

/**
 * Gets unique aircraft organized into manufacturer sections.
 */
export async function getUniqueAircraftSorted(
  db: SQLite.SQLiteDatabase,
): Promise<AircraftSection[]> {
  const allAircraft = await getUniqueAircraft(db)
  const remaining = [...allAircraft]

  const removeMatching = (predicate: (a: string) => boolean): string[] => {
    const matched: string[] = []
    for (let i = remaining.length - 1; i >= 0; i--) {
      if (predicate(remaining[i])) {
        matched.push(remaining[i])
        remaining.splice(i, 1)
      }
    }
    return matched.sort()
  }

  return [
    {
      title: "Antonov",
      data: removeMatching((a) => a.toLowerCase().includes("antonov")),
    },
    {
      title: "Atlas",
      data: removeMatching((a) => a.toLowerCase().includes("atlas")),
    },
    {
      title: "Beech",
      data: [
        ...removeMatching((a) => a.toLowerCase().includes("beech")),
        ...removeMatching((a) => a.toLowerCase().includes("king air")),
      ].sort(),
    },
    {
      title: "de Havilland",
      data: removeMatching((a) => a.toLowerCase().includes("otter")),
    },
    {
      title: "Douglas",
      data: [
        ...removeMatching((a) => a.toLowerCase().includes("dc3")),
        ...removeMatching((a) => a.toLowerCase().includes("dc9")),
        ...removeMatching((a) => a.toLowerCase().includes("dc-3")),
        ...removeMatching((a) => a.toLowerCase().includes("dc-9")),
      ].sort(),
    },
    {
      title: "Cessna",
      data: removeMatching((a) => a.toLowerCase().includes("cessna")),
    },
    {
      title: "PAC",
      data: removeMatching((a) => a.toLowerCase().includes("pac")),
    },
    {
      title: "Pilatus",
      data: removeMatching((a) => a.toLowerCase().includes("pilatus")),
    },
    {
      title: "Piper",
      data: removeMatching((a) => a.toLowerCase().includes("piper")),
    },
    {
      title: "Other",
      data: remaining.sort(),
    },
  ].filter((section) => section.data.length > 0)
}

/**
 * Gets all unique service names.
 */
export async function getUniqueServices(db: SQLite.SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ value: string }>(`
    SELECT DISTINCT value
    FROM dropzones, json_each(services)
    ORDER BY value
  `)
  return rows.map((r) => r.value)
}

/**
 * Gets all unique training types.
 */
export async function getUniqueTraining(db: SQLite.SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ value: string }>(`
    SELECT DISTINCT value
    FROM dropzones, json_each(training)
    ORDER BY value
  `)
  return rows.map((r) => r.value)
}

/**
 * Searches dropzones by text query.
 * Searches in name, description, and website.
 */
export async function searchDropzones(
  db: SQLite.SQLiteDatabase,
  query: string,
): Promise<Dropzone[]> {
  const searchTerm = `%${query.toLowerCase()}%`
  const rows = await db.getAllAsync<DropzoneRow>(
    "SELECT * FROM dropzones WHERE searchable_text LIKE ? ORDER BY name",
    searchTerm,
  )
  return rows.map(rowToDropzone)
}
