import { useEffect, useState } from "react"

import { getFilteredDropzones } from "../queries"
import type { Dropzone } from "../types"
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
  const { db, isReady, dataVersion } = useDatabase()
  const [dropzones, setDropzones] = useState<Dropzone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    getFilteredDropzones(db, itemType, item)
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
  }, [db, isReady, item, itemType, dataVersion])

  return { dropzones, isLoading, error }
}
