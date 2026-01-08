import { FC } from "react"
import { View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

const SEPARATOR: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.palette.neutral300,
})

export const ListSeparator: FC = function ListSeparator() {
  const { themed } = useAppTheme()
  return <View style={themed(SEPARATOR)} />
}
