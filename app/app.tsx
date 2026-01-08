/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}
import "./utils/gestureHandler"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { StatusBar } from "expo-status-bar"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { PaperProvider } from "react-native-paper"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { LoadingScreen } from "./components/LoadingScreen"
import { DatabaseProvider, useDatabase } from "./database"
import { initI18n } from "./i18n"
import { AppNavigator } from "./navigators/AppNavigator"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { ThemeProvider } from "./theme/context"
import { customFontsToLoad } from "./theme/typography"
import { loadDateFnsLocale } from "./utils/formatDate"
import * as storage from "./utils/storage"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

/**
 * Wrapper component that shows LoadingScreen while database is initializing.
 */
function DatabaseLoadingWrapper({ children }: { children: React.ReactNode }): JSX.Element | null {
  const { isReady, progress, message } = useDatabase()

  if (!isReady) {
    return <LoadingScreen message={message} progress={progress} />
  }

  return <>{children}</>
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    Promise.all([initI18n().then(() => setIsI18nInitialized(true)), loadDateFnsLocale()])
  }, [])

  // Before we show the app, we have to wait for our state to be ready.
  // In the meantime, don't render anything. This will be the background
  // color set in native by rootView's background color.
  // In iOS: application:didFinishLaunchingWithOptions:
  // In Android: https://stackoverflow.com/a/45838109/204044
  // You can replace with your own loading component if you wish.
  if (!isNavigationStateRestored || !isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    return null
  }

  // otherwise, we're ready to render the app
  return (
    <>
      <StatusBar style="light" />
      <ThemeProvider>
        <PaperProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <KeyboardProvider>
              <DatabaseProvider>
                <DatabaseLoadingWrapper>
                  <AppNavigator
                    initialState={initialNavigationState}
                    onStateChange={onNavigationStateChange}
                  />
                </DatabaseLoadingWrapper>
              </DatabaseProvider>
            </KeyboardProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </ThemeProvider>
    </>
  )
}
