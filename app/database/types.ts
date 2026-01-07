import type { LocationObject } from "expo-location"

/**
 * Raw database row as stored in SQLite.
 * Array fields are stored as JSON strings.
 */
export interface DropzoneRow {
  anchor: number
  name: string
  email: string
  description: string
  phone: string
  website: string
  aircraft: string // JSON array string
  location: string // JSON array string
  services: string // JSON array string
  training: string // JSON array string
  latitude: number
  longitude: number
  state_code: string
  name_first_letter: string
  searchable_text: string
}

/**
 * Parsed dropzone object for use in the app.
 */
export interface Dropzone {
  anchor: number
  name: string
  email: string
  description: string
  phone: string
  website: string
  aircraft: string[]
  location: string[]
  services: string[]
  training: string[]
  coordinates: {
    latitude: number
    longitude: number
  }
  stateCode: string
  nameFirstLetter: string
  searchableText: string
}

/**
 * Dropzone with calculated distance from user.
 */
export interface DropzoneWithDistance extends Dropzone {
  distanceFromUser: number
}

/**
 * State grouping with count for by-state screen.
 */
export interface StateGroup {
  stateCode: string
  count: number
}

/**
 * Aircraft section for sectioned list display.
 */
export interface AircraftSection {
  title: string
  data: string[]
}

export type { LocationObject }
