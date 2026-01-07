import * as SQLite from "expo-sqlite"

const DATABASE_NAME = "dropzones.db"

let database: SQLite.SQLiteDatabase | null = null

/**
 * Returns the SQLite database instance.
 * Opens the database if not already open.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME)
  }
  return database
}

/**
 * Closes the database connection.
 * Call this when the app is shutting down.
 */
export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync()
    database = null
  }
}
