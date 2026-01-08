import { FC } from "react"
import { View, ViewStyle, TextStyle, Image, ImageStyle } from "react-native"
import { ActivityIndicator, ProgressBar, Text } from "react-native-paper"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

export interface LoadingScreenProps {
  message?: string | null
  progress?: { current: number; total: number } | null
}

/**
 * Full-screen loading overlay shown during database initialization.
 * Displays progress bar and status messages.
 */
export const LoadingScreen: FC<LoadingScreenProps> = ({ message, progress }) => {
  const { themed } = useAppTheme()

  const progressPercent = progress ? progress.current / progress.total : 0
  const progressText = progress
    ? `${progress.current.toLocaleString()} / ${progress.total.toLocaleString()}`
    : null

  const percentageText = progress ? `${Math.round(progressPercent * 100)}%` : null

  return (
    <View style={themed($container)}>
      <View style={themed($content)}>
        {/* App Logo */}
        <Image
          source={require("../../assets/images/adaptive-icon.png")}
          style={themed($logo)}
          resizeMode="contain"
        />

        {/* Progress Bar or Activity Indicator */}
        <View style={themed($progressContainer)}>
          {progress ? (
            <ProgressBar progress={progressPercent} style={themed($progressBar)} />
          ) : (
            <ActivityIndicator size="large" style={themed($activityIndicator)} />
          )}
        </View>

        {/* Status Message */}
        {message && <Text style={themed($messageText)}>{message}</Text>}

        {/* Progress Text */}
        {progressText && <Text style={themed($progressText)}>{progressText}</Text>}

        {/* Percentage */}
        {percentageText && <Text style={themed($percentageText)}>{percentageText}</Text>}
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
  justifyContent: "center",
  alignItems: "center",
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "80%",
  alignItems: "center",
  gap: spacing.md,
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: 120,
  height: 120,
  marginBottom: 40,
})

const $progressContainer: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  minHeight: 40,
  justifyContent: "center",
  alignItems: "center",
})

const $progressBar: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: 8,
  borderRadius: 4,
})

const $activityIndicator: ThemedStyle<ViewStyle> = () => ({
  // ActivityIndicator styles
})

const $messageText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 18,
  color: colors.text,
  textAlign: "center",
  marginTop: spacing.sm,
})

const $progressText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
  marginTop: spacing.xs,
})

const $percentageText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  marginTop: spacing.xs,
})
