import { useEffect, useState } from "react"

import { getUniqueAircraftSorted, getUniqueServices, getUniqueTraining } from "../queries"
import type { AircraftSection } from "../types"
import { useDatabase } from "./useDatabase"

interface UseUniqueAircraftResult {
  aircraftSections: AircraftSection[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to get unique aircraft organized into manufacturer sections.
 */
export function useUniqueAircraft(): UseUniqueAircraftResult {
  const { db, isReady, dataVersion } = useDatabase()
  const [aircraftSections, setAircraftSections] = useState<AircraftSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    getUniqueAircraftSorted(db)
      .then((r) => {
        if (!ignore) setAircraftSections(r)
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

  return { aircraftSections, isLoading, error }
}

interface UseUniqueServicesResult {
  services: string[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to get all unique service names.
 */
export function useUniqueServices(): UseUniqueServicesResult {
  const { db, isReady, dataVersion } = useDatabase()
  const [services, setServices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    getUniqueServices(db)
      .then((r) => {
        if (!ignore) setServices(r)
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

  return { services, isLoading, error }
}

interface UseUniqueTrainingResult {
  training: string[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to get all unique training types.
 */
export function useUniqueTraining(): UseUniqueTrainingResult {
  const { db, isReady, dataVersion } = useDatabase()
  const [training, setTraining] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return
    let ignore = false

    setIsLoading(true)
    setError(null)

    getUniqueTraining(db)
      .then((r) => {
        if (!ignore) setTraining(r)
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

  return { training, isLoading, error }
}
