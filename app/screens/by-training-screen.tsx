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

const TRAINING_TITLES = {
  iad: "Instructor Assisted Deployment",
  aff: "Assisted Free Fall",
  sl: "Static Line",
  tandem: "Tandem",
}

export const ByTrainingScreen: Component = observer(function ByTrainingScreen() {
  const navigation = useNavigation()
  const { uniqueTraining } = useStores()

  const renderItem = ({ item }) => (
    <ListItem
      bottomDivider
      onPress={() =>
        navigation.navigate("list-detail", {
          item,
          itemType: "training",
          title: TRAINING_TITLES[item.toLowerCase()],
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title>{TRAINING_TITLES[item.toLowerCase()]}</ListItem.Title>
        <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Chevron type="font-awesome" name="chevron-right" />
    </ListItem>
  )

  return (
    <FlatList
      style={FULL}
      data={uniqueTraining}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
      // initialNumToRender={5}
      // maxToRenderPerBatch={5}
    />
  )
})
