import React from "react"
import PrimaryStack from "./primary-stack"
import MapStack from "./map-stack"
import { colors } from "../theme"
import { Icon, IconProps } from "react-native-elements"
import Animated from "react-native-reanimated"

import {
  AnimatedTabBarNavigator,
  DotSize,
  TabElementDisplayOptions,
  TabButtonLayout,
  IAppearanceOptions,
} from "react-native-animated-nav-tab-bar"

class IconClassComponent extends React.Component<IconProps> {
  render() {
    return <Icon {...this.props} color={colors.primary} />
  }
}

const AnimatedIcon = Animated.createAnimatedComponent(IconClassComponent)

const TabBarIcon = (props: IconProps & { focused: boolean; tintColor: string }) => {
  return <AnimatedIcon {...props} size={props.size ? props.size : 24} color={props.tintColor} />
}

export type NavigatorParamList = {
  dropzones: undefined
  map: undefined
  Home: undefined
  Profile: undefined
}

const Tabs = AnimatedTabBarNavigator<NavigatorParamList>()

// const tabs: TabsConfig<BubbleTabBarItemConfig> = {
//   dropzones: {
//     labelStyle: {
//       color: colors.primary,
//     },
//     icon: {
//       component: ({ size }) => <AnimatedIcon name="plane" size={size} type="font-awesome" />,
//       activeColor: colors.primary,
//       inactiveColor: colors.primaryLighter,
//     },
//     background: {
//       activeColor: colors.palette.white,
//       inactiveColor: colors.palette.white,
//     },
//   },
//   map: {
//     labelStyle: {
//       color: colors.primary,
//     },
//     icon: {
//       component: ({ size }) => <AnimatedIcon name="map" size={size} type="font-awesome" />,
//       activeColor: colors.primary,
//       inactiveColor: colors.palette.white,
//     },
//     background: {
//       activeColor: colors.palette.white,
//       inactiveColor: colors.palette.white,
//     },
//   },
// }

const TabNavigator = () => {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="dropzones"
      tabBarOptions={{
        activeTintColor: colors.palette.white,
        inactiveTintColor: colors.primaryLighter,
        activeBackgroundColor: colors.primary,
      }}
      appearance={{
        shadow: true,
        floating: true,
        whenActiveShow: TabElementDisplayOptions.BOTH,
        dotSize: DotSize.SMALL,
      }}
    >
      <Tabs.Screen
        name="dropzones"
        component={PrimaryStack}
        options={{
          tabBarLabel: "Dropzones",
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              focused={focused}
              tintColor={color}
              name="plane"
              type="font-awesome"
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        component={MapStack}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              focused={focused}
              tintColor={color}
              name="map"
              type="font-awesome"
              size={size}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  )
}

export default TabNavigator
