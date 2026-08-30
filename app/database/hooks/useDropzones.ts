import { useEffect, useState } from "react"

import { getAllDropzones } from "../queries"
import type { Dropzone } from "../types"
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
  const { db, isReady, dataVersion } = useDatabase()
  const [dropzones, setDropzones] = useState<Dropzone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    getAllDropzones(db)
      .then((r) => {
        if (!ignore) setDropzones(r)
      })
      .catch((e) => {
        if (!ignore) setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [db, isReady, dataVersion])

  return { dropzones, isLoading, error }
}
