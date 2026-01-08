import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type * as SQLite from "expo-sqlite"

import {
  checkForUpdates,
  applyUpdate,
  incrementLaunchCount,
  shouldCheckForUpdates,
  setLastUpdateCheck,
} from "@/services/data-update"

import { getDatabase } from "../database"
import { createSchema } from "../schema"
import { seedDatabase } from "../seed"

interface DatabaseContextValue {
  db: SQLite.SQLiteDatabase | null
  isReady: boolean
  error: Error | null
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
  error: null,
})

interface DatabaseProviderProps {
  children: ReactNode
}

/**
 * Performs an automatic update check in the background.
 * Silently applies updates without prompting the user.
 */
async function performAutoUpdateCheck(database: SQLite.SQLiteDatabase): Promise<void> {
  const launchCount = incrementLaunchCount()
  console.log(`App launch count: ${launchCount}`)

  if (!shouldCheckForUpdates(launchCount)) {
    return
  }

  console.log("Checking for data updates...")
  const result = await checkForUpdates(database)
  setLastUpdateCheck(new Date().toISOString())

  if (result.error) {
    console.log(`Update check failed: ${result.error}`)
    return
  }

  if (result.hasUpdate) {
    console.log(`Update available: ${result.currentVersion} -> ${result.remoteVersion}`)
    console.log("Applying update in background...")
    const updateResult = await applyUpdate(database)
    if (updateResult.success) {
      console.log(
        `Update complete: version ${updateResult.newVersion} with ${updateResult.dropzoneCount} dropzones`,
      )
    } else {
      console.log(`Update failed: ${updateResult.error}`)
    }
  } else {
    console.log(`Data is up to date (version ${result.currentVersion})`)
  }
}

/**
 * Provider component that initializes the database and makes it available via context.
 * Renders children only after database is ready.
 */
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function initialize() {
      try {
        console.log("Initializing database...")
        const database = await getDatabase()
        await createSchema(database)
        await seedDatabase(database)
        setDb(database)
        setIsReady(true)
        console.log("Database ready")

        // Perform automatic update check in background (don't await)
        performAutoUpdateCheck(database).catch((e) => {
          console.error("Auto update check failed:", e)
        })
      } catch (e) {
        console.error("Database initialization failed:", e)
        setError(e instanceof Error ? e : new Error(String(e)))
      }
    }

    initialize()
  }, [])

  return (
    <DatabaseContext.Provider value={{ db, isReady, error }}>{children}</DatabaseContext.Provider>
  )
}

/**
 * Hook to access the database context.
 * Returns the database instance, ready state, and any error.
 */
export function useDatabase(): DatabaseContextValue {
  return useContext(DatabaseContext)
}
