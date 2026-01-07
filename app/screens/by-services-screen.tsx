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

export const ByServicesScreen: Component = observer(function ByServicesScreen() {
  const navigation = useNavigation()
  const { uniqueServices } = useStores()
  const { themed } = useAppTheme()

  const renderItem = ({ item }) => (
    <ListItem
      bottomDivider
      onPress={() =>
        navigation.navigate("list-detail", {
          item,
          itemType: "services",
          title: item,
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
      style={themed(FULL)}
      data={uniqueServices}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
    />
  )
})
