import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { View } from "react-native"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"

import MapStack from "./map-stack"
import PrimaryStack from "./primary-stack"

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

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerBackButtonDisplayMode: "minimal",
        tabBarActiveTintColor: colors.palette.neutral100,
        tabBarInactiveTintColor: colors.palette.primary200,
        tabBarStyle: {
          backgroundColor: colors.headerBackground,
        },
      }}
      initialRouteName="dropzones"
    >
      <Tab.Screen
        name="dropzones"
        component={PrimaryStack}
        options={{
          tabBarLabel: "Dropzones",
          tabBarIcon: ({ color, size }) => <Icon name="plane" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="map"
        component={MapStack}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => <Icon name="map" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default TabNavigator
