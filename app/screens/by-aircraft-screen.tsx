import React, { FunctionComponent as Component } from "react"
import { useStores } from "../models/root-store/root-store-context"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { color } from "../theme"
import { ListItem } from "react-native-elements"

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background,
}

const keyExtractor = (item, index) => index.toString()

export const ByAircraftScreen: Component = observer(function ByAircraftScreen() {
  const navigation = useNavigation()
  const { uniqueAircraft } = useStores()

  const renderItem = ({ item }) => (
    <ListItem
      bottomDivider
      onPress={() =>
        navigation.navigate("list-detail", {
          item,
          itemType: "aircraft",
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title>{item}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron type="font-awesome" name="chevron-right" />
    </ListItem>
  )

  return (
    <FlatList
      style={FULL}
      data={uniqueAircraft}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
      // initialNumToRender={5}
      // maxToRenderPerBatch={5}
    />
  )
})
