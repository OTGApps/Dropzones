import { FC, useCallback } from "react"
import { ViewStyle, FlatList } from "react-native"
import { FontAwesome as Icon } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { List } from "react-native-paper"

import { ListSeparator } from "@/components"
import type { PrimaryNavigationProp } from "@/navigators/primary-navigator"
import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { useUniqueServices } from "../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const keyExtractor = (_item: string, index: number) => index.toString()

export const ByServicesScreen: FC = function ByServicesScreen() {
  const navigation = useNavigation<PrimaryNavigationProp>()
  const { services: uniqueServices } = useUniqueServices()
  const { themed } = useAppTheme()

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
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
    />
  )
}
