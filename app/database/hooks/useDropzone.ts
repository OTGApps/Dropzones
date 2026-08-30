import { useEffect, useState } from "react"

import { getDropzoneById } from "../queries"
import type { Dropzone } from "../types"
import { useDatabase } from "./useDatabase"

interface UseDropzoneResult {
  dropzone: Dropzone | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch a single dropzone by its anchor ID.
 */
export function useDropzone(anchor: number | string): UseDropzoneResult {
  const { db, isReady, dataVersion } = useDatabase()
  const [dropzone, setDropzone] = useState<Dropzone | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const anchorNum = typeof anchor === "string" ? parseInt(anchor, 10) : anchor

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    getDropzoneById(db, anchorNum)
      .then((r) => {
        if (!ignore) setDropzone(r)
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
  }, [db, isReady, anchorNum, dataVersion])

  return { dropzone, isLoading, error }
}
