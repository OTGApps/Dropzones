// Database initialization
export { getDatabase, closeDatabase } from "./database"
export { createSchema } from "./schema"
export { seedDatabase, seedDatabaseFromRemote } from "./seed"

// Types
export type {
  Dropzone,
  DropzoneRow,
  DropzoneWithDistance,
  StateGroup,
  AircraftSection,
} from "./types"

// Query functions
export {
  getDropzoneById,
  getAllDropzones,
  getDropzonesByState,
  getDropzonesGroupedByState,
  getFilteredDropzones,
  getUniqueAircraft,
  getUniqueAircraftSorted,
  getUniqueServices,
  getUniqueTraining,
  searchDropzones,
} from "./queries"

// React hooks
export {
  DatabaseProvider,
  useDatabase,
  useDropzone,
  useDropzones,
  useDropzonesByState,
  useDropzonesGroupedByState,
  useFilteredDropzones,
  useUniqueAircraft,
  useUniqueServices,
  useUniqueTraining,
  useDropzoneSearch,
  useNearbyDropzones,
} from "./hooks"
