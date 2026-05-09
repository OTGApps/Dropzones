import { View, ViewStyle, TextStyle, Text } from "react-native"
import { getLocales } from "expo-localization"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

interface SpeedLimitSignProps {
  km?: number
}

export function SpeedLimitSign(props: SpeedLimitSignProps) {
  const { themed } = useAppTheme()

  const km = props.km ?? 0
  const isMetric = getLocales()[0].measurementSystem === "metric"
  const distanceNumber = isMetric ? Math.round(km) : Math.round(km * 0.621371)

  return (
    <View style={themed($speedLimitSign)}>
      <Text style={themed($milesText)}>{isMetric ? "KM" : "MILES"}</Text>
      <Text style={themed($distanceText)}>{distanceNumber.toString()}</Text>
    </View>
  )
}

const $speedLimitSign: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "column-reverse",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2.5,
  borderColor: colors.palette.neutral900,
  borderRadius: 6,
  padding: spacing.xxxs,
  marginRight: spacing.sm,
})

const $milesText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral900,
  textAlign: "center",
  fontSize: 10,
})

const $distanceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral900,
  textAlign: "center",
  fontSize: 22,
  lineHeight: 23,
  fontWeight: "bold",
  margin: 0,
  padding: 0,
})
