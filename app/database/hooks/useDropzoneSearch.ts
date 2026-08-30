import { useEffect, useState, useCallback } from "react"
import type { Dropzone } from "../types"
import { searchDropzones, getAllDropzones } from "../queries"
import { useDatabase } from "./useDatabase"

interface UseDropzoneSearchResult {
  results: Dropzone[]
  isLoading: boolean
  error: Error | null
  search: (query: string) => void
}

/**
 * Hook for searching dropzones with debounced query.
 * Returns all dropzones when query is empty.
 */
export function useDropzoneSearch(): UseDropzoneSearchResult {
  const { db, isReady, dataVersion } = useDatabase()
  const [results, setResults] = useState<Dropzone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    const performSearch = async () => {
      try {
        const next =
          query.trim() === "" ? await getAllDropzones(db) : await searchDropzones(db, query)
        if (!ignore) setResults(next)
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e : new Error(String(e)))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    performSearch()

    return () => {
      ignore = true
    }
  }, [db, isReady, query, dataVersion])

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery)
  }, [])

  return { results, isLoading, error, search }
}
