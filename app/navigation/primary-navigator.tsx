/**
 * The root navigator is used to switch between major navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow (which is contained in your PrimaryNavigator) which the user
 * will use once logged in.
 */

import React from "react"
import { createNativeStackNavigator } from "react-native-screens/native-stack"
import {
  WelcomeScreen,
  AlphabeticalScreen,
  ByStateScreen,
  ByAircraftScreen,
  ByServicesScreen,
  ByTrainingScreen,
  FlaggedScreen,
  DropzoneDetailScreen,
  ListDetailScreen,
  NearMeScreen,
} from "../screens"
import { color } from "../theme"
import _ from "lodash"

export type PrimaryParamList = {
  welcome: undefined
  alphabetical: undefined
  map: undefined
  "list-detail": undefined
  "near-me": undefined
  "dropzone-detail": undefined
  "by-state": undefined
  "by-aircraft": undefined
  "by-services": undefined
  "by-training": undefined
  flagged: undefined
}

const Stack = createNativeStackNavigator<PrimaryParamList>()

export function PrimaryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: "",
        gestureEnabled: true,
        headerStyle: {
          backgroundColor: color.primary,
        },
        headerTintColor: color.palette.white,
        headerTitleStyle: {
          // @ts-ignore
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          title: "Find Dropzones",
        }}
        component={WelcomeScreen}
      />
      <Stack.Screen
        name="list-detail"
        options={({ route }) => ({ title: _.get(route, "params.title", "Detail") })}
        component={ListDetailScreen}
      />
      <Stack.Screen
        name="near-me"
        options={({ route }) => ({ title: _.get(route, "params.item", "Dropzones Near Me") })}
        component={NearMeScreen}
      />
      <Stack.Screen
        name="dropzone-detail"
        options={({ route }) => ({ title: _.get(route, "params.title", "Dropzone Detail") })}
        component={DropzoneDetailScreen}
      />
      <Stack.Screen
        name="alphabetical"
        options={{
          title: "Alphabetical",
        }}
        component={AlphabeticalScreen}
      />
      <Stack.Screen
        name="by-state"
        options={{
          title: "By State",
        }}
        component={ByStateScreen}
      />
      <Stack.Screen
        name="by-aircraft"
        options={{
          title: "By Aircraft",
        }}
        component={ByAircraftScreen}
      />
      <Stack.Screen
        name="flagged"
        options={{
          title: "Flagged",
        }}
        component={FlaggedScreen}
      />
      <Stack.Screen
        name="by-services"
        options={{
          title: "By Services Offered",
        }}
        component={ByServicesScreen}
      />
      <Stack.Screen
        name="by-training"
        options={{
          title: "By Training Offered",
        }}
        component={ByTrainingScreen}
      />
    </Stack.Navigator>
  )
}

/**
 * A list of routes from which we're allowed to leave the app when
 * the user presses the back button on Android.
 *
 * Anything not on this list will be a standard `back` action in
 * react-navigation.
 *
 * `canExit` is used in ./app/app.tsx in the `useBackButtonHandler` hook.
 */
const exitRoutes = ["welcome"]
export const canExit = (routeName: string) => exitRoutes.includes(routeName)
