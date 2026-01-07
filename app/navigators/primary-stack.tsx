import _ from "lodash"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useAppTheme } from "@/theme/context"

import { PrimaryNavigator } from "./primary-navigator"
import { AboutScreen } from "../screens"

export type RootParamList = {
  primaryStack: undefined
  mapStack: undefined
  about: undefined
}

const Stack = createNativeStackNavigator<RootParamList>()

const PrimaryStack = () => {
  const {
    theme: { colors },
  } = useAppTheme()

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
            backgroundColor: colors.tint,
          },
          headerTintColor: colors.palette.neutral100,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  )
}

export default PrimaryStack
