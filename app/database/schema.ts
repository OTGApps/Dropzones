import type * as SQLite from "expo-sqlite"

/**
 * SQL statements for creating the database schema.
 */

export const CREATE_DROPZONES_TABLE = `
  CREATE TABLE IF NOT EXISTS dropzones (
    anchor INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    description TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    website TEXT DEFAULT '',
    aircraft TEXT DEFAULT '[]',
    location TEXT DEFAULT '[]',
    services TEXT DEFAULT '[]',
    training TEXT DEFAULT '[]',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    airport TEXT DEFAULT '',
    country TEXT DEFAULT '',
    state TEXT DEFAULT '',
    state_code TEXT DEFAULT 'International',
    name_first_letter TEXT NOT NULL,
    searchable_text TEXT NOT NULL
  )
`

export const CREATE_STATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_dropzones_state ON dropzones(state_code)
`

export const CREATE_NAME_LETTER_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_dropzones_name_letter ON dropzones(name_first_letter)
`

export const CREATE_METADATA_TABLE = `
  CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`

/**
 * Checks if the database schema exists.
 */
async function schemaExists(db: SQLite.SQLiteDatabase): Promise<boolean> {
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='dropzones'",
  )
  return result !== null && result.count > 0
}

/**
 * Creates all tables and indexes in the database.
 * Only runs if the schema doesn't already exist.
 */
export async function createSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  const exists = await schemaExists(db)

  if (exists) {
    console.log("[DB] Schema already exists, skipping creation")
    return
  }

  console.log("[DB] Creating database schema...")
  const startTime = Date.now()

  await db.execAsync(`
    ${CREATE_DROPZONES_TABLE};
    ${CREATE_STATE_INDEX};
    ${CREATE_NAME_LETTER_INDEX};
    ${CREATE_METADATA_TABLE};
  `)

  const elapsed = Date.now() - startTime
  console.log(`[DB] Schema created in ${elapsed}ms`)
}
