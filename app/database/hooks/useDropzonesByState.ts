import { useEffect, useState } from "react"
import type { Dropzone, StateGroup } from "../types"
import { getDropzonesByState, getDropzonesGroupedByState } from "../queries"
import { useDatabase } from "./useDatabase"

interface UseDropzonesByStateResult {
  stateGroups: StateGroup[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to get dropzone counts grouped by state.
 */
export function useDropzonesByState(): UseDropzonesByStateResult {
  const { db, isReady } = useDatabase()
  const [stateGroups, setStateGroups] = useState<StateGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return

    setIsLoading(true)
    setError(null)

    getDropzonesByState(db)
      .then(setStateGroups)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [db, isReady])

  return { stateGroups, isLoading, error }
}

interface UseDropzonesGroupedByStateResult {
  groupedDropzones: Record<string, Dropzone[]>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to get all dropzones grouped by state (full objects).
 */
export function useDropzonesGroupedByState(): UseDropzonesGroupedByStateResult {
  const { db, isReady } = useDatabase()
  const [groupedDropzones, setGroupedDropzones] = useState<Record<string, Dropzone[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return

    setIsLoading(true)
    setError(null)

    getDropzonesGroupedByState(db)
      .then(setGroupedDropzones)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [db, isReady])

  return { groupedDropzones, isLoading, error }
}
