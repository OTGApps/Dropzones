import { createNativeStackNavigator } from "@react-navigation/native-stack"
import _ from "lodash"

import { useAppTheme } from "@/theme/context"

import {
  WelcomeScreen,
  AlphabeticalScreen,
  ByStateScreen,
  ByAircraftScreen,
  ByServicesScreen,
  ByTrainingScreen,
  // FlaggedScreen,
  DropzoneDetailScreen,
  ListDetailScreen,
  NearMeScreen,
} from "../screens"

export type PrimaryParamList = {
  "welcome": undefined
  "alphabetical": undefined
  "map": undefined
  "list-detail": undefined
  "near-me": undefined
  "dropzone-detail": undefined
  "by-state": undefined
  "by-aircraft": undefined
  "by-services": undefined
  "by-training": undefined
  // flagged: undefined
}

const Stack = createNativeStackNavigator<PrimaryParamList>()

export function PrimaryNavigator() {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: "minimal",
        gestureEnabled: true,
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTintColor: colors.palette.neutral100,
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
      {/* <Stack.Screen
        name="flagged"
        options={{
          title: "Flagged",
        }}
        component={FlaggedScreen}
      /> */}
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
