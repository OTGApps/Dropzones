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

import { useUniqueTraining } from "../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const keyExtractor = (_item: string, index: number) => index.toString()

const TRAINING_TITLES: Record<string, string> = {
  "iad": "Instructor Assisted Deployment",
  "aff": "Assisted Free Fall",
  "sl": "Static Line",
  "tandem": "Tandem",
  "instructor assisted deployment": "Instructor Assisted Deployment",
  "static line": "Static Line",
}

export const ByTrainingScreen: FC = function ByTrainingScreen() {
  const navigation = useNavigation<PrimaryNavigationProp>()
  const { training: uniqueTraining } = useUniqueTraining()
  const { themed } = useAppTheme()

  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      const title = TRAINING_TITLES[item.toLowerCase()] ?? item
      return (
        <List.Item
          title={title}
          onPress={() =>
            navigation.navigate("list-detail", {
              item,
              itemType: "training",
              title,
            })
          }
          right={(props) => (
            <Icon {...props} name="chevron-right" size={16} style={themed($chevronRight)} />
          )}
        />
      )
    },
    [navigation, themed],
  )

  return (
    <FlatList
      style={themed(FULL)}
      data={uniqueTraining}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
    />
  )
}
