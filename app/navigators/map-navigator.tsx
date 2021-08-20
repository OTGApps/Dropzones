import React from "react"

import { createNativeStackNavigator } from "react-native-screens/native-stack"
import { MapScreen, DropzoneDetailScreen } from "../screens"
import { color } from "../theme"
import _ from "lodash"

export type MapParamList = {
  map: undefined
  dropzones: undefined
  "dropzone-detail": undefined
}

const Stack = createNativeStackNavigator<MapParamList>()

export function MapNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
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
    >
      <Stack.Screen name="map" options={{ title: "Dropzone Map" }} component={MapScreen} />
      <Stack.Screen
        name="dropzone-detail"
        options={({ route }) => ({ title: _.get(route, "params.title", "Dropzone Detail") })}
        component={DropzoneDetailScreen}
      />
    </Stack.Navigator>
  )
}

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["map"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
