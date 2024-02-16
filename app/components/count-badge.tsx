import * as React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "react-native-elements"
import { colors, spacing } from "../theme"

const BADGE_CONTAINER: ViewStyle = {
  backgroundColor: colors.primary,
  borderRadius: spacing.xs,
}

const BADGE_TEXT: TextStyle = {
  color: colors.lightText,
  fontWeight: "bold",
  margin: spacing.xs,
}

export interface CountBadgeProps {
  count: number
}

export function CountBadge(props: CountBadgeProps) {
  const { count } = props

  return (
    <View style={BADGE_CONTAINER}>
      <Text style={BADGE_TEXT}>{count.toString()}</Text>
    </View>
  )
}
