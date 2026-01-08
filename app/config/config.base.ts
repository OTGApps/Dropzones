export interface ConfigBaseProps {
  persistNavigation: "always" | "dev" | "prod" | "never"
  catchErrors: "always" | "dev" | "prod" | "never"
  exitRoutes: string[]
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
   * Remote URL to check for dropzone data updates.
   */
  dataUpdateUrl:
    "https://raw.githubusercontent.com/OTGApps/Dropzones/refs/heads/master/assets/dropzones.geojson",

  /**
   * Check for remote updates every N app launches.
   */
  dataCheckInterval: 5,
}

export default BaseConfig
