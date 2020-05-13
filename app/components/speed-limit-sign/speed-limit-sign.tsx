import * as React from "react"
import { View, ViewStyle, ImageStyle, TextStyle } from "react-native"
import { Text } from 'react-native-elements'
import { spacing, color } from "../../theme"

const SPEED_LIMIT_SIGN: ViewStyle = {
  flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
}

const MILES_TEXT: TextStyle = {
  color: color.palette.white,
  textAlign: 'center',
  fontSize: 10
}

const DISTANCE_TEXT: TextStyle = {
  color: color.palette.white,
  textAlign: 'center',
  fontSize: 22
}

export interface SpeedLimitSignProps {
  distanceFromUser: string
}

export function SpeedLimitSign(props: SpeedLimitSignProps) {
  return (
    <View style={SPEED_LIMIT_SIGN}>
      <Text style={MILES_TEXT}>MILES</Text>
      <Text style={DISTANCE_TEXT} adjustsFontSizeToFit allowFontScaling>{parseInt(props.distanceFromUser).toString() || '🤷‍♂️'}</Text>
    </View>
  )
}
