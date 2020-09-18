import React, { FunctionComponent as Component, useState, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { ViewStyle, FlatList, Alert, ActivityIndicator } from "react-native"
import { color } from "../../theme"
import { CountBadge } from "../../components"
import { ListItem, Icon } from "react-native-elements"
import Geolocation from "@react-native-community/geolocation"

const MenuItems = require("./menu-items.json")

const FULL: ViewStyle = {
  flex: 1,
}

export const WelcomeScreen: Component = observer(function WelcomeScreen() {
  const navigation = useNavigation()

  Geolocation.setRNConfiguration({ skipPermissionRequests: false, authorizationLevel: "whenInUse" })

  // This boolean state is used when getting a user's location.
  // It disables all the rows from interaction and shows a loading icon
  // on the near-me menu item.
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name={"info-circle"}
          type={"font-awesome"}
          size={22}
          color={color.palette.white}
          onPress={() => navigation.navigate("about")}
        />
      ),
    })
  }, [])

  const openNearMeScreen = () => {
    setLoading(true)
    Geolocation.getCurrentPosition(
      position => {
        setLoading(false)
        if (__DEV__) console.tron.log("opening the near me screen.", JSON.stringify(position))
        navigation.navigate("near-me", {
          location: JSON.stringify(position),
        })
      },
      error => {
        setLoading(false)
        Alert.alert("Error", JSON.stringify(error))
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
    )
  }

  const rightElement = item => {
    switch (item.screen) {
      case "near-me":
        return loading ? <ActivityIndicator /> : null
      default:
        return null
    }
  }

  const renderItem = ({ item }) => (
    <ListItem
      bottomDivider
      disabled={loading || !item.screen}
      onPress={
        item.screen &&
        (() => {
          switch (item.screen) {
            case "near-me":
              openNearMeScreen()
              break
            default:
              navigation.navigate(item.screen)
              break
          }
        })
      }
    >
      <Icon color={color.primary} name={item.iconName} type="font-awesome" />
      <ListItem.Content>
        <ListItem.Title>{item.title}</ListItem.Title>
        <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
      </ListItem.Content>
      {rightElement(item)}
      <ListItem.Chevron type="font-awesome" name="chevron-right" />
    </ListItem>
  )

  return (
    <FlatList
      style={FULL}
      data={MenuItems}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
})
