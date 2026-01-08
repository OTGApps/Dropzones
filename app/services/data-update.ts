import type * as SQLite from "expo-sqlite"

import Config from "@/config"
import { seedDatabaseFromRemote, LOCAL_DATA_VERSION } from "@/database/seed"
import { load, save } from "@/utils/storage"

/**
 * Result of checking for updates
 */
export interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  remoteVersion?: string
  error?: string
}

/**
 * Result of applying an update
 */
export interface UpdateApplyResult {
  success: boolean
  newVersion?: string
  dropzoneCount?: number
  error?: string
}

/**
 * Remote GeoJSON data structure
 */
interface RemoteGeoJSON {
  type: "FeatureCollection"
  metadata: {
    version: string
  }
  features: Array<{
    type: "Feature"
    properties: {
      anchor: number
      name: string
      email: string
      description?: string
      phone?: string
      website?: string
      aircraft?: string[]
      location?: string[]
      services?: string[]
      training?: string[]
    }
    geometry: {
      type: "Point"
      coordinates: [number, number]
    }
  }>
}

const STORAGE_KEY_LAUNCH_COUNT = "app_launch_count"
const STORAGE_KEY_LAST_CHECK = "last_update_check"

/**
 * Gets the current stored data version from the database
 */
async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<string> {
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM metadata WHERE key = 'data_version'",
    )
    return result?.value || LOCAL_DATA_VERSION
  } catch {
    return LOCAL_DATA_VERSION
  }
}

/**
 * Fetches the remote GeoJSON data
 */
async function fetchRemoteData(): Promise<{ data: RemoteGeoJSON | null; error?: string }> {
  try {
    const response = await fetch(Config.dataUpdateUrl, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return { data: null, error: `HTTP ${response.status}: ${response.statusText}` }
    }

    const data = (await response.json()) as RemoteGeoJSON
    return { data }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Checks if a remote update is available
 */
export async function checkForUpdates(db: SQLite.SQLiteDatabase): Promise<UpdateCheckResult> {
  const currentVersion = await getCurrentVersion(db)

  const { data, error } = await fetchRemoteData()

  if (error || !data) {
    return {
      hasUpdate: false,
      currentVersion,
      error: error || "Failed to fetch remote data",
    }
  }

  const remoteVersion = data.metadata.version || "unknown"
  const hasUpdate = remoteVersion !== currentVersion

  return {
    hasUpdate,
    currentVersion,
    remoteVersion,
  }
}

/**
 * Downloads and applies the remote update
 */
export async function applyUpdate(db: SQLite.SQLiteDatabase): Promise<UpdateApplyResult> {
  const { data, error } = await fetchRemoteData()

  if (error || !data) {
    return {
      success: false,
      error: error || "Failed to fetch remote data",
    }
  }

  if (!data.metadata.version) {
    return {
      success: false,
      error: "Remote data does not contain a version field",
    }
  }

  try {
    await seedDatabaseFromRemote(db, {
      version: data.metadata.version,
      features: data.features,
    })

    return {
      success: true,
      newVersion: data.metadata.version,
      dropzoneCount: data.features.length,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to apply update",
    }
  }
}

/**
 * Checks if we should perform an automatic update check based on launch count
 */
export function shouldCheckForUpdates(launchCount: number): boolean {
  return launchCount > 0 && launchCount % Config.dataCheckInterval === 0
}

/**
 * Gets the launch count from storage
 */
export function getLaunchCount(): number {
  return load<number>(STORAGE_KEY_LAUNCH_COUNT) || 0
}

/**
 * Increments and returns the new launch count
 */
export function incrementLaunchCount(): number {
  const current = getLaunchCount()
  const next = current + 1
  save(STORAGE_KEY_LAUNCH_COUNT, next)
  return next
}

/**
 * Gets the last update check timestamp
 */
export function getLastUpdateCheck(): string | null {
  return load<string>(STORAGE_KEY_LAST_CHECK) || null
}

/**
 * Sets the last update check timestamp
 */
export function setLastUpdateCheck(timestamp: string): void {
  save(STORAGE_KEY_LAST_CHECK, timestamp)
}
