import * as React from "react"
import { View, ViewStyle, TextStyle, Text } from "react-native"
import { isMetric } from "expo-localization"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

const SPEED_LIMIT_SIGN: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "column-reverse",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2.5,
  borderColor: colors.palette.neutral900,
  borderRadius: 6,
  padding: spacing.md / 2,
})

const MILES_TEXT: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral900,
  textAlign: "center",
  fontSize: 10,
})

const DISTANCE_TEXT: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral900,
  textAlign: "center",
  fontSize: 22,
  lineHeight: 23,
  fontWeight: "bold",
  margin: 0,
  padding: 0,
})

interface SpeedLimitSignProps {
  km?: number
}

export function SpeedLimitSign(props: SpeedLimitSignProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed(SPEED_LIMIT_SIGN)}>
      <Text style={themed(MILES_TEXT)}>{isMetric ? "KM" : "MILES"}</Text>
      <Text style={themed(DISTANCE_TEXT)}>
        {parseInt(isMetric ? props.km : props.km * 0.621371).toString()}
      </Text>
    </View>
  )
}
