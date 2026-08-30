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

import { useEffect, useState, type PropsWithChildren } from "react"
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { PaperProvider } from "react-native-paper"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { LoadingScreen } from "./components/LoadingScreen"
import { DatabaseProvider, useDatabase } from "./database"
import { initI18n } from "./i18n"
import { AppNavigator } from "./navigators/AppNavigator"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { ThemeProvider, useAppTheme } from "./theme/context"
import { darkPaperTheme, lightPaperTheme } from "./theme/paperTheme"
import { customFontsToLoad } from "./theme/typography"
import { loadDateFnsLocale } from "./utils/formatDate"
import * as storage from "./utils/storage"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Keep the native splash screen visible until the app shell (fonts, i18n, nav
// state) is ready. Database load progress is shown afterwards by LoadingScreen.
SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({ duration: 300, fade: true })

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
 * Feeds the active app theme into react-native-paper so its components match light / dark mode.
 */
function ThemedPaperProvider({ children }: PropsWithChildren) {
  const { themeContext } = useAppTheme()
  return (
    <PaperProvider theme={themeContext === "dark" ? darkPaperTheme : lightPaperTheme}>
      {children}
    </PaperProvider>
  )
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

  const isAppShellReady =
    isNavigationStateRestored && isI18nInitialized && (areFontsLoaded || !!fontLoadError)

  useEffect(() => {
    if (isAppShellReady) {
      SplashScreen.hideAsync()
    }
  }, [isAppShellReady])

  // Before the app shell is ready, keep rendering nothing so the native splash
  // screen stays up (we prevented its auto-hide above).
  if (!isAppShellReady) {
    return null
  }

  // otherwise, we're ready to render the app
  return (
    <ThemeProvider>
      <ThemedPaperProvider>
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
      </ThemedPaperProvider>
    </ThemeProvider>
  )
}
