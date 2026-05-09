import { FC } from "react"
import { View, Text, ViewStyle, TextStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

const CONTAINER: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.xl,
})

const MESSAGE: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  textAlign: "center",
})

interface ListEmptyProps {
  message?: string
}

export const ListEmpty: FC<ListEmptyProps> = function ListEmpty({
  message = "No dropzones found",
}) {
  const { themed } = useAppTheme()
  return (
    <View style={themed(CONTAINER)}>
      <Text style={themed(MESSAGE)}>{message}</Text>
    </View>
  )
}
