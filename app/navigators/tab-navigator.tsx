import React from "react"
import AnimatedTabBar, { TabsConfig, BubbleTabBarItemConfig } from "@gorhom/animated-tabbar"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Icon } from "react-native-elements"
import Animated from "react-native-reanimated"

import MapStack from "./map-stack"
import PrimaryStack from "./primary-stack"
import { color } from "../theme"
import { palette } from "../theme/palette"

class IconClassComponent extends React.Component {
  render() {
    return <Icon name={""} {...this.props} color={color.primary} />
  }
}

const AnimatedIcon = Animated.createAnimatedComponent(IconClassComponent)

export type NavigatorParamList = {
  dropzones: undefined
  map: undefined
  Home: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<NavigatorParamList>()

const tabs: TabsConfig<BubbleTabBarItemConfig> = {
  dropzones: {
    labelStyle: {
      color: color.primary,
    },
    icon: {
      component: ({ size }) => <AnimatedIcon name="plane" size={size} type="font-awesome" />,
      activeColor: color.primary,
      inactiveColor: color.primaryLighter,
    },
    background: {
      activeColor: palette.white,
      inactiveColor: palette.white,
    },
  },
  map: {
    labelStyle: {
      color: color.primary,
    },
    icon: {
      component: ({ size }) => <AnimatedIcon name="map" size={size} type="font-awesome" />,
      activeColor: color.primary,
      inactiveColor: palette.white,
    },
    background: {
      activeColor: palette.white,
      inactiveColor: palette.white,
    },
  },
}

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="dropzones"
      tabBar={(props) => (
        <AnimatedTabBar tabs={tabs} style={{ backgroundColor: color.primary }} {...props} />
      )}
    >
      <Tab.Screen
        name="dropzones"
        component={PrimaryStack}
        options={{ tabBarLabel: "Dropzones" }}
      />
      <Tab.Screen name="map" component={MapStack} options={{ tabBarLabel: "Map" }} />
    </Tab.Navigator>
  )
}

export default TabNavigator
