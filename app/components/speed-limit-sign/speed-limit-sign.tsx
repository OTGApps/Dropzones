import * as React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "react-native-elements"
import { spacing, color } from "../../theme"
import { isMetric } from "expo-localization"

const SPEED_LIMIT_SIGN: ViewStyle = {
  flexDirection: "column-reverse",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2.5,
  borderColor: color.palette.black,
  borderRadius: 6,
  padding: spacing[1] / 2,
}

const MILES_TEXT: TextStyle = {
  color: color.palette.black,
  textAlign: "center",
  fontSize: 10,
}

const DISTANCE_TEXT: TextStyle = {
  color: color.palette.black,
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
  return (
    <View style={SPEED_LIMIT_SIGN}>
      <Text style={MILES_TEXT}>{isMetric ? "KM" : "MILES"}</Text>
      <Text style={DISTANCE_TEXT}>
        {parseInt(isMetric ? props.km : props.km * 0.621371).toString()}
      </Text>
    </View>
  )
}
