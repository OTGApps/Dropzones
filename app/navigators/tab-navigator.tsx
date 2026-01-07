import { Component } from "react"
import AnimatedTabBar, { TabsConfig, BubbleTabBarItemConfig } from "@gorhom/animated-tabbar"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Icon } from "react-native-elements"
import Animated from "react-native-reanimated"

import { useAppTheme } from "@/theme/context"

import MapStack from "./map-stack"
import PrimaryStack from "./primary-stack"

class IconClassComponent extends Component<{ color: string }> {
  render() {
    return <Icon name={""} {...this.props} />
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

const TabNavigator = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  const tabs: TabsConfig<BubbleTabBarItemConfig> = {
    dropzones: {
      labelStyle: {
        color: colors.tint,
      },
      icon: {
        component: ({ size }) => (
          <AnimatedIcon name="plane" size={size} type="font-awesome" color={colors.tint} />
        ),
        activeColor: colors.tint,
        inactiveColor: colors.tintInactive,
      },
      background: {
        activeColor: colors.palette.neutral100,
        inactiveColor: colors.palette.neutral100,
      },
    },
    map: {
      labelStyle: {
        color: colors.tint,
      },
      icon: {
        component: ({ size }) => (
          <AnimatedIcon name="map" size={size} type="font-awesome" color={colors.tint} />
        ),
        activeColor: colors.tint,
        inactiveColor: colors.tintInactive,
      },
      background: {
        activeColor: colors.palette.neutral100,
        inactiveColor: colors.palette.neutral100,
      },
    },
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="dropzones"
      tabBar={(props) => (
        <AnimatedTabBar tabs={tabs} style={{ backgroundColor: colors.tint }} {...props} />
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
