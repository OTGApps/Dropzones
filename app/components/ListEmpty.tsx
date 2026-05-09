import { FC, useEffect, useRef } from "react"
import Icon from "@expo/vector-icons/FontAwesome"
import { View, Animated, StyleSheet, ViewStyle, TextStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

interface ListEmptyProps {
  message?: string
}

export const ListEmpty: FC<ListEmptyProps> = function ListEmpty({
  message = "No dropzones found",
}) {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const planeX = useRef(new Animated.Value(-300)).current
  const sadFaceX = useRef(new Animated.Value(-300)).current
  const textOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(planeX, {
          toValue: 0,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(planeX, {
            toValue: 400,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(sadFaceX, {
            toValue: 0,
            tension: 60,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start()
  }, [planeX, sadFaceX, textOpacity])

  return (
    <View style={themed($container)}>
      <View style={$iconContainer}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateX: planeX }, { rotate: "45deg" }] },
          ]}
        >
          <Icon name="plane" size={128} color={colors.textDim} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: sadFaceX }] }]}>
          <Icon name="frown-o" size={128} color={colors.textDim} />
        </Animated.View>
      </View>
      <Animated.Text style={[themed($message), { opacity: textOpacity }]}>{message}</Animated.Text>
    </View>
  )
}

const $iconContainer: ViewStyle = {
  width: 128,
  height: 128,
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.xl,
  gap: spacing.md,
})

const $message: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  textAlign: "center",
})
