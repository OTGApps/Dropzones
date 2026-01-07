import { useEffect, useState } from "react"
import type { Dropzone } from "../types"
import { getAllDropzones } from "../queries"
import { useDatabase } from "./useDatabase"

interface UseDropzonesResult {
  dropzones: Dropzone[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch all dropzones.
 */
export function useDropzones(): UseDropzonesResult {
  const { db, isReady } = useDatabase()
  const [dropzones, setDropzones] = useState<Dropzone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return

    setIsLoading(true)
    setError(null)

    getAllDropzones(db)
      .then(setDropzones)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [db, isReady])

  return { dropzones, isLoading, error }
}
