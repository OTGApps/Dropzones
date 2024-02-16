import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import _ from "lodash"

import { colors } from "../theme"

import { PrimaryNavigator } from "./primary-navigator"
import { AboutScreen } from "../screens"

export type RootParamList = {
  primaryStack: undefined
  mapStack: undefined
  about: undefined
}

const Stack = createNativeStackNavigator<RootParamList>()

const PrimaryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
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
          headerBackTitleVisible: false,
          headerShown: true,
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.palette.white,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  )
}

export default PrimaryStack
