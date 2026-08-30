import { FC, useCallback, useMemo } from "react"
import { ViewStyle, FlatList, View } from "react-native"
import { FontAwesome as Icon } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { List, Avatar, Badge } from "react-native-paper"

import { ListSeparator } from "@/components"
import type { PrimaryNavigationProp } from "@/navigators/primary-navigator"
import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { States } from "./states"
import { useDropzonesByState } from "../../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

export const ByStateScreen: FC = function ByStateScreen() {
  const navigation = useNavigation<PrimaryNavigationProp>()
  const { stateGroups } = useDropzonesByState()
  const { themed } = useAppTheme()

  // Separate US states from international and combine international into one group
  const processedData = useMemo(() => {
    const stateCountMap: Record<string, number> = {}
    const usStates: string[] = []
    let internationalCount = 0

    for (const group of stateGroups) {
      const stateCode = group.stateCode.toLowerCase()
      // Check if this is a mapped US state/territory
      if (States[stateCode as keyof typeof States] && stateCode !== "international") {
        usStates.push(group.stateCode)
        stateCountMap[group.stateCode] = group.count
      } else {
        // Everything else goes to international
        internationalCount += group.count
      }
    }

    // Add international if there are any international dropzones
    const dataSource = [...usStates]
    if (internationalCount > 0) {
      dataSource.push("international")
      stateCountMap["international"] = internationalCount
    }

    return { dataSource, stateCountMap }
  }, [stateGroups])

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const thisState = States[item.toLowerCase() as keyof typeof States]
      if (!thisState) return null

      return (
        <List.Item
          title={thisState.fullName}
          onPress={() =>
            navigation.navigate("list-detail", {
              item,
              itemType: "state",
              title: thisState.fullName,
            })
          }
          left={(props) =>
            thisState.image ? (
              <Avatar.Image
                {...props}
                key={`state-image-${index}`}
                source={thisState.image}
                size={40}
              />
            ) : null
          }
          right={(props) => (
            <View style={themed($rightContainer)}>
              <Badge style={themed($badge)}>{processedData.stateCountMap[item] || 0}</Badge>
              <Icon {...props} name="chevron-right" size={16} style={themed($chevronRight)} />
            </View>
          )}
        />
      )
    },
    [navigation, themed, processedData.stateCountMap],
  )

  return (
    <FlatList
      style={themed(FULL)}
      data={processedData.dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
    />
  )
}

const $rightContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.xs,
})

const $badge: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginRight: spacing.xs,
  alignSelf: "center",
  fontSize: 14,
  backgroundColor: colors.palette.primary500,
})
