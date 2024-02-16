import React, { FunctionComponent as Component, useState, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { ViewStyle, FlatList, ActivityIndicator, Alert } from "react-native"
import { colors } from "../../theme"
import { ListItem, Icon } from "react-native-elements"
import * as Location from "expo-location"

const MenuItems = require("./menu-items.json")

const FULL: ViewStyle = {
  flex: 1,
}

export const WelcomeScreen: Component = observer(function WelcomeScreen() {
  const navigation = useNavigation()
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
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
        if (__DEV__) console.log("opening the near me screen.", location)
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
          type={"font-awesome"}
          size={22}
          color={colors.palette.white}
          onPress={() => navigation.navigate("about")}
        />
      ),
    })
  }, [])

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

  const renderItem = ({ item }) => (
    <ListItem
      bottomDivider
      disabled={!item.screen}
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
      <Icon color={colors.primary} name={item.iconName} type="font-awesome" />
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
