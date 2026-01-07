import { useEffect, useState } from "react"
import type { AircraftSection } from "../types"
import { getUniqueAircraftSorted, getUniqueServices, getUniqueTraining } from "../queries"
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
  const { db, isReady } = useDatabase()
  const [aircraftSections, setAircraftSections] = useState<AircraftSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return

    setIsLoading(true)
    setError(null)

    getUniqueAircraftSorted(db)
      .then(setAircraftSections)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [db, isReady])

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
  const { db, isReady } = useDatabase()
  const [services, setServices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return

    setIsLoading(true)
    setError(null)

    getUniqueServices(db)
      .then(setServices)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [db, isReady])

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
  const { db, isReady } = useDatabase()
  const [training, setTraining] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady) return

    setIsLoading(true)
    setError(null)

    getUniqueTraining(db)
      .then(setTraining)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [db, isReady])

  return { training, isLoading, error }
}
