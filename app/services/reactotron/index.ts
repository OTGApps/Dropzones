import { onSnapshot } from "mobx-state-tree"
import { mst } from "reactotron-mst"
import { Reactotron as ReactotronClient } from "@/devtools/ReactotronClient"
import { RootStore } from "@/models/root-store/root-store"
import { clear } from "@/utils/storage"

/**
 * Reactotron service for MST integration.
 * The main Reactotron setup is done in devtools/ReactotronConfig.ts
 * This class provides MST-specific functionality for the Environment.
 */
export class Reactotron {
  rootStore: RootStore | undefined

  /**
   * Setup the Reactotron service.
   * Most configuration is already done in ReactotronConfig.ts
   * This adds MST-specific plugins.
   */
  async setup() {
    if (__DEV__) {
      // Filter out noisy MST actions
      const RX = /postProcessSnapshot|@APPLY_SNAPSHOT/

      // Add MST plugin to Reactotron
      // @ts-ignore - reactotron-mst types don't perfectly match ReactotronReactNative
      ReactotronClient.use(
        mst({
          filter: (event) => RX.test(event.name) === false,
        }),
      )

      // Add custom command for resetting store
      ReactotronClient.onCustomCommand({
        title: "Reset Root Store",
        description: "Resets the MST store",
        command: "resetStore",
        handler: () => {
          console.tron?.log("Resetting store")
          clear()
        },
      })
    }
  }

  /**
   * Hook into the root store for tracking state changes.
   *
   * @param rootStore The root MST store
   * @param initialData The initial state data
   */
  setRootStore(rootStore: RootStore, initialData: any) {
    if (__DEV__) {
      this.rootStore = rootStore

      // Track the MST node in Reactotron
      console.tron?.trackMstNode?.(rootStore)

      // Display initial state
      console.tron?.display?.({
        name: "ROOT STORE",
        value: initialData,
        preview: "Initial State",
      })
    }
  }
}
