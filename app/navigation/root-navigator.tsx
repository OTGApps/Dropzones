import React from "react"
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native"

import { createNativeStackNavigator } from "react-native-screens/native-stack"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { RootParamList, MapParamList } from "./types"
import { PrimaryNavigator } from "./primary-navigator"
import { MapNavigator } from "./map-navigator"
import { color } from "../theme"
import { Icon, Text } from 'react-native-elements'
import _ from 'lodash'

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

const TabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarLabel: _.startCase(route.name),
        tabBarIcon: ({ focused, size }) => {
          let iconName = 'plane'
          switch (route.name) {
            // Add more here if you ever add more tabs. 🤷‍♂️
            case 'map':
              iconName = route.name.toLowerCase()
              break
            default:
              break
          }
          return (
            <Icon
              name={iconName}
              size={size}
              color={focused ? color.primary : color.palette.lighterGrey}
              type='font-awesome'
            />
          )
        },
      })}

      tabBarOptions={{
        activeTintColor: color.primary,
        inactiveTintColor: color.palette.lighterGrey,
      }}
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
    prefixes: ['dropzones://'],
  }

  return (
    <NavigationContainer {...props} ref={ref} linking={linking} fallback={<Text>Loading...</Text>}>
      <TabStack />
    </NavigationContainer>
  )
})

RootNavigator.displayName = "RootNavigator"
