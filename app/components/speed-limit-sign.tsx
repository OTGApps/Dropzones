import * as React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "react-native-elements"
import { spacing, colors } from "../theme"
import { isMetric } from "expo-localization"

const SPEED_LIMIT_SIGN: ViewStyle = {
  flexDirection: "column-reverse",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2.5,
  borderColor: colors.palette.black,
  borderRadius: 6,
  padding: spacing.sm / 2,
}

const MILES_TEXT: TextStyle = {
  color: colors.palette.black,
  textAlign: "center",
  fontSize: 10,
}

const DISTANCE_TEXT: TextStyle = {
  color: colors.palette.black,
  textAlign: "center",
  fontSize: 22,
  lineHeight: 23,
  fontWeight: "bold",
  margin: 0,
  padding: 0,
}
interface SpeedLimitSignProps {
  km?: number
}

export function SpeedLimitSign(props: SpeedLimitSignProps) {
  const distance = React.useMemo(
    () => parseInt(isMetric ? props.km : props.km * 0.621371).toString(),
    [isMetric],
  )
  return (
    <View style={SPEED_LIMIT_SIGN}>
      <Text style={MILES_TEXT}>{isMetric ? "KM" : "MILES"}</Text>
      <Text style={DISTANCE_TEXT}>{distance}</Text>
    </View>
  )
}
