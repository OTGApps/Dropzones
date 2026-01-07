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
  const { db, isReady } = useDatabase()
  const [results, setResults] = useState<Dropzone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!db || !isReady) return

    setIsLoading(true)
    setError(null)

    const performSearch = async () => {
      try {
        if (query.trim() === "") {
          const all = await getAllDropzones(db)
          setResults(all)
        } else {
          const searchResults = await searchDropzones(db, query)
          setResults(searchResults)
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)))
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [db, isReady, query])

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery)
  }, [])

  return { results, isLoading, error, search }
}
