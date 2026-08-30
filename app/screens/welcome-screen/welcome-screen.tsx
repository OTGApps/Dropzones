import { FC, useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, FlatList, ActivityIndicator, Alert } from "react-native"
import * as Location from "expo-location"
import { useNavigation } from "@react-navigation/native"
import { List } from "react-native-paper"
import { FontAwesome as Icon } from "@expo/vector-icons"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"
import { ListSeparator } from "@/components"

const MenuItems = require("./menu-items.json")

const FULL: ViewStyle = {
  flex: 1,
}

export const WelcomeScreen: FC = function WelcomeScreen() {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const navigation = useNavigation()
  // This boolean state shows a loading icon on the near-me menu item while
  // we resolve the user's location.
  const [loading, setLoading] = useState(false)

  const getLocation = async (): Promise<Location.LocationObject | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      return null
    }

    return Location.getCurrentPositionAsync({})
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name={"info-circle"}
          size={22}
          color={colors.headerText}
          onPress={() => navigation.navigate("about")}
          style={themed($headerIcon)}
        />
      ),
    })
  }, [colors.headerText, navigation, themed])

  const openNearMeScreen = async () => {
    setLoading(true)
    try {
      const loc = await getLocation()
      if (loc) {
        navigation.navigate("near-me", { location: loc })
      } else {
        Alert.alert("Location denied", "Permission to access your location was denied.")
      }
    } catch {
      Alert.alert(
        "Location unavailable",
        "Could not get your location. Check that location services are enabled.",
      )
    } finally {
      setLoading(false)
    }
  }

  const rightElement = (item) => {
    switch (item.screen) {
      case "near-me":
        return loading ? <ActivityIndicator /> : null
      default:
        return null
    }
  }

  const renderItem = ({ item, index }) => {
    const rightEl = rightElement(item)

    return (
      <List.Item
        title={item.title}
        description={item.subtitle}
        disabled={!item.screen}
        style={themed($listItem)}
        onPress={
          item.screen
            ? () => {
                switch (item.screen) {
                  case "near-me":
                    openNearMeScreen()
                    break
                  default:
                    navigation.navigate(item.screen)
                    break
                }
              }
            : undefined
        }
        left={(props) => (
          <Icon
            {...props}
            name={item.iconName}
            color={colors.tint}
            size={20}
            style={themed($leftIcon)}
          />
        )}
        right={(props) => (
          <View style={themed($rightContainer)}>
            {rightEl}
            <Icon {...props} name="chevron-right" size={16} style={themed($chevronRight)} />
          </View>
        )}
      />
    )
  }

  return (
    <FlatList
      style={themed(FULL)}
      data={MenuItems}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
    />
  )
}

const $headerIcon: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginRight: spacing.md,
})

const $listItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingLeft: spacing.md,
})

const $leftIcon: ThemedStyle<TextStyle> = ({ spacing }) => ({
  alignSelf: "center",
  marginRight: spacing.sm,
  width: 20,
})

const $rightContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})
