import { FunctionComponent as Component } from "react"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { ListItem } from "react-native-elements"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { useStores } from "../models/root-store/root-store-context"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

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
  const { themed } = useAppTheme()

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
      </ListItem.Content>
      <ListItem.Chevron type="font-awesome" name="chevron-right" />
    </ListItem>
  )

  return (
    <FlatList
      style={themed(FULL)}
      data={uniqueTraining}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
    />
  )
})
