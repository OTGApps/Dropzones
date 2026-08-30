import { useEffect, useState } from "react"

import { getDropzonesByState, getDropzonesGroupedByState } from "../queries"
import type { Dropzone, StateGroup } from "../types"
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
  const { db, isReady, dataVersion } = useDatabase()
  const [stateGroups, setStateGroups] = useState<StateGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    getDropzonesByState(db)
      .then((r) => {
        if (!ignore) setStateGroups(r)
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
  const { db, isReady, dataVersion } = useDatabase()
  const [groupedDropzones, setGroupedDropzones] = useState<Record<string, Dropzone[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    getDropzonesGroupedByState(db)
      .then((r) => {
        if (!ignore) setGroupedDropzones(r)
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

  return { groupedDropzones, isLoading, error }
}
