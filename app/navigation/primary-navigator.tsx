import React from "react"
import { createNativeStackNavigator } from "react-native-screens/native-stack"
import {
  WelcomeScreen,
  AlphabeticalScreen,
  ByStateScreen,
  ByAircraftScreen,
  ByServicesScreen,
  ByTrainingScreen,

  DropzoneDetailScreen,
  ListDetailScreen,
  NearMeScreen,
} from "../screens"
import { PrimaryParamList } from "./types"
import { color } from "../theme"
import _ from 'lodash'

const Stack = createNativeStackNavigator<PrimaryParamList>()

export function PrimaryNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: '',
        gestureEnabled: true,
        headerStyle: {
          backgroundColor: color.primary,
        },
        headerTintColor: color.palette.white,
        headerTitleStyle: {
          // @ts-ignore
          fontWeight: 'bold'
        },
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          title: 'Find Dropzones',
        }}
        component={WelcomeScreen}
      />
      <Stack.Screen
        name="list-detail"
        options={({ route }) => ({ title: _.get(route, 'params.item', 'Detail') })}
        component={ListDetailScreen}
      />
      <Stack.Screen
        name="near-me"
        options={({ route }) => ({ title: _.get(route, 'params.item', 'Dropzones Near Me') })}
        component={NearMeScreen}
      />
      <Stack.Screen
        name="dropzone-detail"
        options={({ route }) => ({ title: _.get(route, 'params.item.name', 'Dropzone Detail') })}
        component={DropzoneDetailScreen}
      />
      <Stack.Screen
        name="alphabetical"
        options={{
          title: 'Alphabetical',
        }}
        component={AlphabeticalScreen}
      />
      <Stack.Screen
        name="by-state"
        options={{
          title: 'By State',
        }}
        component={ByStateScreen}
      />
      <Stack.Screen
        name="by-aircraft"
        options={{
          title: 'By Aircraft',
        }}
        component={ByAircraftScreen}
      />
      <Stack.Screen
        name="by-services"
        options={{
          title: 'By Services Offered',
        }}
        component={ByServicesScreen}
      />
      <Stack.Screen
        name="by-training"
        options={{
          title: 'By Training Offered',
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
 */
export const exitRoutes: string[] = ["welcome"]
