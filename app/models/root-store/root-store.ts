import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * A RootStore model.
 *
 * Note: Dropzone data has been migrated to SQLite for better performance.
 * See app/database/ for the new data layer.
 *
 * This store can still be used for other app-wide state like flags, settings, etc.
 */
export const RootStoreModel = types.model("RootStore").props({
  // Add any non-dropzone state here (e.g., flags, settings)
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
