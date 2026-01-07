import { ViewStyle, TextStyle } from "react-native"

import { ThemedStyle } from "./types"

/* Use this file to define styles that are used in multiple places in your app. */
export const $styles = {
  row: { flexDirection: "row" } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  flexWrap: { flexWrap: "wrap" } as ViewStyle,

  toggleInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  } as ViewStyle,
}

/**
 * Shared themed style for chevron-right icons used in list items.
 * Uses theme's textDim color for proper light/dark mode support.
 */
export const $chevronRight: ThemedStyle<TextStyle> = ({ colors }) => ({
  alignSelf: "center",
  color: colors.textDim,
})
