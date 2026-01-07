import { useEffect, useState } from "react"
import type { Dropzone } from "../types"
import { getFilteredDropzones } from "../queries"
import { useDatabase } from "./useDatabase"

type ItemType = "state" | "aircraft" | "services" | "training"

interface UseFilteredDropzonesResult {
  dropzones: Dropzone[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to filter dropzones by a specific criteria.
 */
export function useFilteredDropzones(item: string, itemType: ItemType): UseFilteredDropzonesResult {
  const { db, isReady } = useDatabase()
  const [dropzones, setDropzones] = useState<Dropzone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return

    setIsLoading(true)
    setError(null)

    getFilteredDropzones(db, itemType, item)
      .then(setDropzones)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [db, isReady, item, itemType])

  return { dropzones, isLoading, error }
}
