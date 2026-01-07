import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "react-native-elements"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

export interface CountBadgeProps {
  count: number
}

export function CountBadge(props: CountBadgeProps) {
  const { count } = props
  const { themed } = useAppTheme()

  return (
    <View style={themed($badgeContainer)}>
      <Text style={themed($badgeText)}>{count.toString()}</Text>
    </View>
  )
}

const $badgeContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  borderRadius: spacing.xxxs,
})

const $badgeText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontWeight: "bold",
  margin: spacing.xxxs,
})
