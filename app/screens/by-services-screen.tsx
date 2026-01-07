import { FunctionComponent as Component } from "react"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

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
    <List.Item
      title={item}
      onPress={() =>
        navigation.navigate("list-detail", {
          item,
          itemType: "services",
          title: item,
        })
      }
      right={(props) => <Icon name="chevron-right" size={16} color="#666" style={{ alignSelf: "center" }} />}
    />
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
