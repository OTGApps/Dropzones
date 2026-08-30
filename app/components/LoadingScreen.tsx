import { FC } from "react"
import { View, ViewStyle, TextStyle, Image, ImageStyle } from "react-native"
import { ActivityIndicator, ProgressBar, Text } from "react-native-paper"

import { useAppTheme } from "@/theme/context"

export interface LoadingScreenProps {
  message?: string | null
  progress?: { current: number; total: number } | null
}

// Must match the expo-splash-screen config in app.json so the native splash
// transitions seamlessly into this screen.
const SPLASH_BACKGROUND = { light: "#114F88", dark: "#191015" }
const SPLASH_IMAGE_WIDTH = 180
const FOREGROUND = "#F4F2F1"

/**
 * Full-screen loading overlay shown during database initialization. Mirrors the
 * native splash screen (same background, same centered logo at the same size) so
 * the handoff from native splash to JS is invisible; progress UI is overlaid
 * below the logo without shifting it.
 */
export const LoadingScreen: FC<LoadingScreenProps> = ({ message, progress }) => {
  const { themeContext } = useAppTheme()

  const progressPercent = progress ? progress.current / progress.total : 0
  const progressText = progress
    ? `${progress.current.toLocaleString()} / ${progress.total.toLocaleString()}`
    : null
  const percentageText = progress ? `${Math.round(progressPercent * 100)}%` : null

  return (
    <View style={[$container, { backgroundColor: SPLASH_BACKGROUND[themeContext] }]}>
      <Image
        source={require("../../assets/images/splash-light.png")}
        style={$logo}
        resizeMode="contain"
      />

      <View style={$overlay}>
        <View style={$progressContainer}>
          {progress ? (
            <ProgressBar progress={progressPercent} color={FOREGROUND} style={$progressBar} />
          ) : (
            <ActivityIndicator size="large" color={FOREGROUND} />
          )}
        </View>

        {message && <Text style={$messageText}>{message}</Text>}
        {progressText && <Text style={$progressText}>{progressText}</Text>}
        {percentageText && <Text style={$progressText}>{percentageText}</Text>}
      </View>
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $logo: ImageStyle = {
  width: SPLASH_IMAGE_WIDTH,
  height: SPLASH_IMAGE_WIDTH,
}

const $overlay: ViewStyle = {
  position: "absolute",
  bottom: "18%",
  width: "80%",
  alignItems: "center",
  gap: 8,
}

const $progressContainer: ViewStyle = {
  width: "100%",
  minHeight: 40,
  justifyContent: "center",
  alignItems: "center",
}

const $progressBar: ViewStyle = {
  width: "100%",
  height: 8,
  borderRadius: 4,
}

const $messageText: TextStyle = {
  fontSize: 18,
  color: FOREGROUND,
  textAlign: "center",
  marginTop: 8,
}

const $progressText: TextStyle = {
  fontSize: 14,
  color: FOREGROUND,
  opacity: 0.7,
  textAlign: "center",
}
