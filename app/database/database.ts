import * as SQLite from "expo-sqlite"

const DATABASE_NAME = "dropzones.db"

let database: SQLite.SQLiteDatabase | null = null

/**
 * Returns the SQLite database instance.
 * Opens the database if not already open.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    console.log(`[DB] Opening database "${DATABASE_NAME}"...`)
    const startTime = Date.now()
    database = await SQLite.openDatabaseAsync(DATABASE_NAME)
    const elapsed = Date.now() - startTime
    console.log(`[DB] Database opened in ${elapsed}ms`)
  }
  return database
}

/**
 * Closes the database connection.
 * Call this when the app is shutting down.
 */
export async function closeDatabase(): Promise<void> {
  if (database) {
    console.log("[DB] Closing database...")
    const startTime = Date.now()
    await database.closeAsync()
    database = null
    const elapsed = Date.now() - startTime
    console.log(`[DB] Database closed in ${elapsed}ms`)
  }
}
