import { FontAwesome as Icon } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import { useAppTheme } from "@/theme/context"

import { MapNavigator } from "./map-navigator"
import { PrimaryNavigator } from "./primary-navigator"

export type NavigatorParamList = {
  dropzones: undefined
  map: undefined
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
        tabBarActiveTintColor: colors.headerText,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.headerBackground,
        },
      }}
      initialRouteName="dropzones"
    >
      <Tab.Screen
        name="dropzones"
        component={PrimaryNavigator}
        options={{
          tabBarLabel: "Dropzones",
          tabBarIcon: ({ color, size }) => <Icon name="plane" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="map"
        component={MapNavigator}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => <Icon name="map" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default TabNavigator
