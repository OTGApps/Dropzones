import { useEffect, useState } from "react"
import type { LocationObject } from "expo-location"
import type { DropzoneWithDistance } from "../types"
import { getAllDropzones } from "../queries"
import { useDatabase } from "./useDatabase"
import distanceCalculator from "../../utils/lat-long-to-km"

interface UseNearbyDropzonesResult {
  dropzones: DropzoneWithDistance[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to get all dropzones sorted by distance from a location.
 */
export function useNearbyDropzones(location: LocationObject | null): UseNearbyDropzonesResult {
  const { db, isReady } = useDatabase()
  const [dropzones, setDropzones] = useState<DropzoneWithDistance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!db || !isReady || !location) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    getAllDropzones(db)
      .then((dzs) => {
        // Compute distances in JavaScript
        const withDistance: DropzoneWithDistance[] = dzs.map((dz) => ({
          ...dz,
          distanceFromUser: distanceCalculator(
            location.coords.latitude,
            location.coords.longitude,
            dz.coordinates.latitude,
            dz.coordinates.longitude,
          ),
        }))

        // Sort by distance
        withDistance.sort((a, b) => a.distanceFromUser - b.distanceFromUser)

        setDropzones(withDistance)
      })
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setIsLoading(false))
  }, [db, isReady, location?.coords.latitude, location?.coords.longitude])

  return { dropzones, isLoading, error }
}
