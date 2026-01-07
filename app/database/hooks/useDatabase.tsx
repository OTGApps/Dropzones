import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type * as SQLite from "expo-sqlite"
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
