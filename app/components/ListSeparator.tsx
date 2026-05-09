import { FC } from "react"
import { View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

export const ListSeparator: FC = function ListSeparator() {
  const { themed } = useAppTheme()
  return <View style={themed($separator)} />
}

const $separator: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.palette.neutral300,
})
