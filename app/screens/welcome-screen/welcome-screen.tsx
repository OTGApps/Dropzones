import { FC, useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, FlatList, ActivityIndicator, Alert } from "react-native"
import * as Location from "expo-location"
import { useNavigation } from "@react-navigation/native"
import { List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

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
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  // This boolean state is used when getting a user's location.
  // It disables all the rows from interaction and shows a loading icon
  // on the near-me menu item.
  const [loading, setLoading] = useState(false)

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied")
      return
    }

    const loc = await Location.getCurrentPositionAsync({})
    setLocation(loc)
  }

  useEffect(() => {
    if (loading) {
      setLoading(false)
      if (errorMsg) {
        Alert.alert("Error", errorMsg)
        setErrorMsg(null)
      } else {
        if (__DEV__) console.tron.log("opening the near me screen.", location)
        navigation.navigate("near-me", {
          location,
        })
      }
    }
  }, [location, errorMsg])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name={"info-circle"}
          size={22}
          color={colors.palette.neutral100}
          onPress={() => navigation.navigate("about")}
          style={themed($headerIcon)}
        />
      ),
    })
  }, [colors.palette.neutral100, navigation, themed])

  const openNearMeScreen = () => {
    setLoading(true)
    getLocation()
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
