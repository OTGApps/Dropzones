import React from "react"

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { MapNavigator } from "./map-navigator"
import _ from "lodash"

export type RootParamList = {
  primaryStack: undefined
  mapStack: undefined
  about: undefined
}

const Stack = createNativeStackNavigator<RootParamList>()

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

export default MapStack
