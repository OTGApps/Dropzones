import { useEffect, useState } from "react"
import type { LocationObject } from "expo-location"

import { getAllDropzones } from "../queries"
import type { DropzoneWithDistance } from "../types"
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
  const { db, isReady, dataVersion } = useDatabase()
  const [dropzones, setDropzones] = useState<DropzoneWithDistance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const latitude = location?.coords.latitude
  const longitude = location?.coords.longitude

  useEffect(() => {
    if (!db || !isReady || latitude === undefined || longitude === undefined) {
      setIsLoading(false)
      return
    }
    let ignore = false

    setIsLoading(true)
    setError(null)

    getAllDropzones(db)
      .then((dzs) => {
        if (ignore) return
        // Compute distances in JavaScript
        const withDistance: DropzoneWithDistance[] = dzs.map((dz) => ({
          ...dz,
          distanceFromUser: distanceCalculator(
            latitude,
            longitude,
            dz.coordinates.latitude,
            dz.coordinates.longitude,
          ),
        }))

        // Sort by distance
        withDistance.sort((a, b) => a.distanceFromUser - b.distanceFromUser)

        setDropzones(withDistance)
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
  }, [db, isReady, dataVersion, latitude, longitude])

  return { dropzones, isLoading, error }
}
