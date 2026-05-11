import { useCallback, useState } from "react"
import { MapType } from "react-native-maps"

export type { MapType }

import { loadString, saveString } from "./storage"

const STORAGE_KEY = "mapType"

export const MAP_TYPES: { value: MapType; label: string; icon: string }[] = [
  { value: "standard", label: "Standard", icon: "map" },
  { value: "satellite", label: "Satellite", icon: "globe" },
  { value: "hybrid", label: "Hybrid", icon: "road" },
  { value: "terrain", label: "Terrain", icon: "tree" },
]

export function useMapType() {
  const [mapType, setMapType] = useState<MapType>(
    () => (loadString(STORAGE_KEY) as MapType) ?? "standard",
  )

  const changeMapType = useCallback((type: MapType) => {
    setMapType(type)
    saveString(STORAGE_KEY, type)
  }, [])

  return { mapType, changeMapType }
}
