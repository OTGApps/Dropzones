/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from "@react-navigation/native"
import { SystemBars } from "react-native-edge-to-edge"

import Config from "@/config"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { useAppTheme } from "@/theme/context"

import type { NavigationProps } from "./navigationTypes"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import TabNavigator from "./tab-navigator"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <>
      {/* The header/tab bar always use the dark-blue `headerBackground`, so system bar
          content stays light regardless of the active theme. */}
      <SystemBars style="light" />

      <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        <ErrorBoundary catchErrors={Config.catchErrors}>
          <TabNavigator />
        </ErrorBoundary>
      </NavigationContainer>
    </>
  )
}
