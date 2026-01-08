export interface ConfigBaseProps {
  persistNavigation: "always" | "dev" | "prod" | "never"
  catchErrors: "always" | "dev" | "prod" | "never"
  exitRoutes: string[]
  /** Version of the bundled dropzone data. Increment when updating dropzones.json */
  dataVersion: string
  /** Remote URL to check for dropzone data updates */
  dataUpdateUrl: string
  /** Check for remote updates every N app launches */
  dataCheckInterval: number
}

export type PersistNavigationConfig = ConfigBaseProps["persistNavigation"]

const BaseConfig: ConfigBaseProps = {
  // This feature is particularly useful in development mode, but
  // can be used in production as well if you prefer.
  persistNavigation: "dev",

  /**
   * Only enable if we're catching errors in the right environment
   */
  catchErrors: "always",

  /**
   * This is a list of all the route names that will exit the app if the back button
   * is pressed while in that screen. Only affects Android.
   */
  exitRoutes: ["Welcome"],

  /**
   * Version of the bundled dropzone data.
   * Increment this when updating the dropzones.json file to trigger
   * a database refresh for existing users.
   * Format: YYYY.MM.DD.revision
   */
  dataVersion: "2025.01.07.1",

  /**
   * Remote URL to check for dropzone data updates.
   */
  dataUpdateUrl:
    "https://raw.githubusercontent.com/OTGApps/USPADropzones/refs/heads/master/dropzones.geojson",

  /**
   * Check for remote updates every N app launches.
   */
  dataCheckInterval: 5,
}

export default BaseConfig
