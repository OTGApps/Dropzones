import { FC } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { SegmentedButtons, Text } from "react-native-paper"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

type DisplayModeValue = "auto" | "light" | "dark"

const BUTTONS: { value: DisplayModeValue; label: string; icon: string }[] = [
  { value: "auto", label: "Auto", icon: "theme-light-dark" },
  { value: "light", label: "Light", icon: "white-balance-sunny" },
  { value: "dark", label: "Dark", icon: "weather-night" },
]

/**
 * Lets the user pin the app to light or dark, or follow the operating system ("auto").
 */
export const DisplayModePicker: FC = () => {
  const { themed, themeSchemeOverride, setThemeContextOverride } = useAppTheme()

  const selected: DisplayModeValue = themeSchemeOverride ?? "auto"

  const handleChange = (value: string) => {
    setThemeContextOverride(value === "auto" ? undefined : (value as "light" | "dark"))
  }

  return (
    <View style={themed($container)}>
      <Text variant="titleMedium" style={themed($label)}>
        Display Mode
      </Text>
      <SegmentedButtons value={selected} onValueChange={handleChange} buttons={BUTTONS} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
  paddingVertical: spacing.md,
})

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})
