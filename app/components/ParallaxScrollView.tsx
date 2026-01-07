import React, { ReactNode } from "react"
import { ScrollView, View, ViewStyle, Dimensions, StyleProp } from "react-native"
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"

const window = Dimensions.get("window")

export interface ParallaxScrollViewProps {
  parallaxHeaderHeight: number
  stickyHeaderHeight?: number
  backgroundColor?: string
  backgroundScrollSpeed?: number
  fadeOutForeground?: boolean
  fadeOutBackground?: boolean
  renderBackground?: () => ReactNode
  renderForeground?: () => ReactNode
  renderStickyHeader?: () => ReactNode
  renderFixedHeader?: () => ReactNode
  contentBackgroundColor?: string
  children: ReactNode
  onScroll?: (event: any) => void
  style?: StyleProp<ViewStyle>
  overScrollMode?: "auto" | "always" | "never"
}

export function ParallaxScrollView({
  parallaxHeaderHeight,
  stickyHeaderHeight = 0,
  backgroundColor = "#000",
  backgroundScrollSpeed = 5,
  fadeOutForeground = true,
  fadeOutBackground = false,
  renderBackground,
  renderForeground,
  renderStickyHeader,
  renderFixedHeader,
  contentBackgroundColor = "transparent",
  children,
  onScroll,
  style,
  overScrollMode = "always",
}: ParallaxScrollViewProps) {
  const scrollY = useSharedValue(0)
  const pivotPoint = parallaxHeaderHeight - stickyHeaderHeight

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const backgroundStyle = useAnimatedStyle(() => {
    const opacity = fadeOutBackground
      ? interpolate(
          scrollY.value,
          [0, pivotPoint * 0.5, pivotPoint * 0.75, pivotPoint],
          [1, 0.3, 0.1, 0],
          Extrapolate.CLAMP,
        )
      : 1

    const translateY = interpolate(
      scrollY.value,
      [0, pivotPoint],
      [0, -(pivotPoint / backgroundScrollSpeed)],
      Extrapolate.EXTEND,
    )

    const scale = interpolate(
      scrollY.value,
      [-window.height, 0],
      [3, 1],
      Extrapolate.CLAMP,
    )

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    }
  })

  const foregroundStyle = useAnimatedStyle(() => {
    const opacity = fadeOutForeground
      ? interpolate(
          scrollY.value,
          [0, pivotPoint * 0.5, pivotPoint * 0.75, pivotPoint],
          [1, 0.3, 0.1, 0],
          Extrapolate.CLAMP,
        )
      : 1

    return { opacity }
  })

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, pivotPoint], [0, 1], Extrapolate.CLAMP)

    const translateY = interpolate(
      scrollY.value,
      [0, pivotPoint],
      [stickyHeaderHeight, 0],
      Extrapolate.CLAMP,
    )

    return {
      opacity,
      transform: [{ translateY }],
    }
  })

  return (
    <View style={[{ flex: 1 }, style]}>
      {/* Background */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            width: window.width,
            height: parallaxHeaderHeight,
            backgroundColor,
          },
          backgroundStyle,
        ]}
      >
        {renderBackground?.()}
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        overScrollMode={overScrollMode}
        contentContainerStyle={{
          paddingTop: parallaxHeaderHeight,
          backgroundColor: contentBackgroundColor,
        }}
      >
        {children}
      </Animated.ScrollView>

      {/* Foreground (parallax header) */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: parallaxHeaderHeight,
          },
          foregroundStyle,
        ]}
      >
        {renderForeground?.()}
      </Animated.View>

      {/* Sticky Header */}
      {renderStickyHeader && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: stickyHeaderHeight,
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor,
                height: stickyHeaderHeight,
              },
              stickyHeaderStyle,
            ]}
          >
            {renderStickyHeader()}
          </Animated.View>
        </View>
      )}

      {/* Fixed Header */}
      {renderFixedHeader && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {renderFixedHeader()}
        </View>
      )}
    </View>
  )
}
