import { FC, useCallback, useMemo } from "react"
import { ViewStyle, FlatList, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { List, Avatar, Badge } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

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
  const navigation = useNavigation()
  const { stateGroups } = useDropzonesByState()
  const { themed } = useAppTheme()

  // Create a lookup map for counts
  const stateCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const group of stateGroups) {
      map[group.stateCode] = group.count
    }
    return map
  }, [stateGroups])

  // Get sorted state codes (2-letter states first, then International)
  const dataSource = useMemo(() => {
    return stateGroups.map((g) => g.stateCode)
  }, [stateGroups])

  const renderItem = useCallback(
    ({ item, index }) => {
      const thisState = States[item.toLowerCase()]

      return (
        <List.Item
          title={thisState && thisState.fullName}
          onPress={() =>
            navigation.navigate("list-detail", {
              item,
              itemType: "state",
              title: States[item.toLowerCase()].fullName,
            })
          }
          left={(props) =>
            thisState ? (
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
              <Badge style={themed($badge)}>{stateCountMap[item] || 0}</Badge>
              <Icon name="chevron-right" size={16} style={themed($chevronRight)} />
            </View>
          )}
        />
      )
    },
    [navigation, themed, stateCountMap],
  )

  return (
    <FlatList
      style={themed(FULL)}
      removeClippedSubviews
      data={dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
}

const $rightContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.xs,
})

const $badge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
  alignSelf: "center",
  fontSize: 14,
})
