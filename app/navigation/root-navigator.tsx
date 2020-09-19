import React from "react"
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"

import { createNativeStackNavigator } from "react-native-screens/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { PrimaryNavigator } from "./primary-navigator"
import { MapNavigator, MapParamList } from "./map-navigator"
import { color } from "../theme"
import { Icon, Text } from "react-native-elements"
import AnimatedTabBar from "@gorhom/animated-tabbar"
import { palette } from "../theme/palette"
import Animated from "react-native-reanimated"
import _ from "lodash"
import { StatusBar } from "react-native"
import { AboutScreen } from "../screens"

/**
 * The root navigator is used to switch between major navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow (which is contained in your PrimaryNavigator) which the user
 * will use once logged in.
 */

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * We recommend using MobX-State-Tree store(s) to handle state rather than navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 */
export type RootParamList = {
  primaryStack: undefined
  mapStack: undefined
  about: undefined
}

const Stack = createNativeStackNavigator<RootParamList>()
const Tab = createBottomTabNavigator<MapParamList>()

const PrimaryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        stackPresentation: "modal",
      }}
    >
      <Stack.Screen
        name="primaryStack"
        component={PrimaryNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="about"
        component={AboutScreen}
        options={{
          title: "About",
          headerShown: true,
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: color.primary,
          },
          headerTintColor: color.palette.white,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  )
}

const MapStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        stackPresentation: "modal",
      }}
    >
      <Stack.Screen
        name="mapStack"
        component={MapNavigator}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

const AnimatedIcon = Animated.createAnimatedComponent(Icon)
const tabs = {
  dropzones: {
    title: "Dropzones",
    labelStyle: {
      color: color.primary,
    },
    icon: {
      component: ({ color, size }) => (
        <AnimatedIcon name={"plane"} size={size} type="font-awesome" color={palette.blue} />
      ),
      activeColor: color.primary,
      inactiveColor: color.primaryLighter,
    },
    background: {
      activeColor: palette.white,
      inactiveColor: palette.white,
    },
  },
  map: {
    title: "Map",
    labelStyle: {
      color: color.primary,
    },
    icon: {
      component: ({ color, size }) => (
        <AnimatedIcon name={"map"} size={size} type="font-awesome" color={palette.blue} />
      ),
      activeColor: color.primary,
      inactiveColor: palette.white,
    },
    background: {
      activeColor: palette.white,
      inactiveColor: palette.white,
    },
  },
}

const tabBarOptions = {
  style: {
    backgroundColor: color.primary,
  },
}

const TabStack = () => {
  return (
    <Tab.Navigator
      tabBarOptions={tabBarOptions}
      tabBar={props => <AnimatedTabBar tabs={tabs} {...props} />}
    >
      <Tab.Screen name="dropzones" component={PrimaryStack} />
      <Tab.Screen name="map" component={MapStack} />
    </Tab.Navigator>
  )
}

export const RootNavigator = React.forwardRef<
  NavigationContainerRef,
  Partial<React.ComponentProps<typeof NavigationContainer>>
>((props, ref) => {
  const linking = {
    prefixes: ["dropzones://"],
    config: {
      "dropzone-detail": "dropzone/:anchor",
    },
  }

  return (
    <NavigationContainer {...props} ref={ref} linking={linking} fallback={<Text>Loading...</Text>}>
      <StatusBar backgroundColor={"transparent"} translucent barStyle="light-content" />
      <TabStack />
    </NavigationContainer>
  )
})

RootNavigator.displayName = "RootNavigator"
