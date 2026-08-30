import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from "react-native-paper"

import { colors as lightColors } from "./colors"
import { colors as darkColors } from "./colorsDark"

/**
 * react-native-paper components (List.Item, Card, Searchbar, Text, …) read their colors from
 * the Paper theme, not from our app theme. Without this bridge they render with the stock
 * light MD3 palette even in dark mode, which is why dark mode looked inconsistent.
 */

export const lightPaperTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.tint,
    onPrimary: lightColors.palette.neutral100,
    background: lightColors.background,
    onBackground: lightColors.text,
    surface: lightColors.palette.neutral100,
    onSurface: lightColors.text,
    surfaceVariant: lightColors.palette.neutral200,
    onSurfaceVariant: lightColors.textDim,
    outline: lightColors.border,
    outlineVariant: lightColors.separator,
    error: lightColors.error,
    errorContainer: lightColors.errorBackground,
  },
}

// A surface lifted off the near-black background so cards / search bars / menus stay visible.
const darkElevated = darkColors.palette.neutral300

export const darkPaperTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.tint,
    onPrimary: darkColors.palette.neutral200,
    background: darkColors.background,
    onBackground: darkColors.text,
    surface: darkColors.background,
    onSurface: darkColors.text,
    surfaceVariant: darkElevated,
    onSurfaceVariant: darkColors.textDim,
    surfaceDisabled: darkElevated,
    onSurfaceDisabled: darkColors.palette.neutral500,
    outline: darkColors.border,
    outlineVariant: darkColors.separator,
    error: darkColors.error,
    elevation: {
      level0: "transparent",
      level1: darkElevated,
      level2: darkElevated,
      level3: darkElevated,
      level4: darkElevated,
      level5: darkElevated,
    },
  },
}
