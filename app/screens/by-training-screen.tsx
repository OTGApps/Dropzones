import { FC, useCallback } from "react"
import { ViewStyle, FlatList } from "react-native"
import Icon from "@expo/vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native"
import { List } from "react-native-paper"

import { ListSeparator } from "@/components"
import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { useUniqueTraining } from "../database"

const keyExtractor = (item: string) => item

const TRAINING_TITLES = {
  "iad": "Instructor Assisted Deployment",
  "aff": "Assisted Free Fall",
  "sl": "Static Line",
  "tandem": "Tandem",
  "instructor assisted deployment": "Instructor Assisted Deployment",
  "static line": "Static Line",
}

export const ByTrainingScreen: FC = function ByTrainingScreen() {
  const navigation = useNavigation()
  const { training: uniqueTraining } = useUniqueTraining()
  const { themed } = useAppTheme()

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <List.Item
        title={TRAINING_TITLES[item.toLowerCase() as keyof typeof TRAINING_TITLES] ?? item}
        onPress={() =>
          navigation.navigate("list-detail", {
            item,
            itemType: "training",
            title: TRAINING_TITLES[item.toLowerCase() as keyof typeof TRAINING_TITLES] ?? item,
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
      style={themed($full)}
      data={uniqueTraining}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
    />
  )
}

const $full: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})
