import { FC, useCallback } from "react"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"
import { ListSeparator } from "@/components"

import { useUniqueServices } from "../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const keyExtractor = (item, index) => index.toString()

export const ByServicesScreen: FC = function ByServicesScreen() {
  const navigation = useNavigation()
  const { services: uniqueServices } = useUniqueServices()
  const { themed } = useAppTheme()

  const renderItem = useCallback(
    ({ item }) => (
      <List.Item
        title={item}
        onPress={() =>
          navigation.navigate("list-detail", {
            item,
            itemType: "services",
            title: item,
          })
        }
        right={(props) => (
          <Icon {...props} name="chevron-right" size={16} style={themed($chevronRight)} />
        )}
      />
    ),
    [navigation, themed],
  )

  return (
    <FlatList
      style={themed(FULL)}
      data={uniqueServices}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
      removeClippedSubviews
    />
  )
}
