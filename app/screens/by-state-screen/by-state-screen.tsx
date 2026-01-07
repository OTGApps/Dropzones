import { FunctionComponent as Component, useCallback, useMemo } from "react"
import { ViewStyle, FlatList, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import _ from "lodash"
import { observer } from "mobx-react-lite"
import { List, Avatar, Badge } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { $chevronRight } from "@/theme/styles"

import { States } from "./states"
import { useStores } from "../../models/root-store/root-store-context"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

export const ByStateScreen: Component = observer(function ByStateScreen() {
  const navigation = useNavigation()
  const rootStore = useStores()
  const { dropzones } = rootStore
  const { themed } = useAppTheme()

  // Count the number of dropzones per state BEFORE rendering. this greatly reduces the load time of the page.
  const groupByState = rootStore.groupByState()

  // Memoize the data processing to prevent recalculation on every render
  const dataSource = useMemo(() => {
    const sortedStates = Object.keys(_.groupBy(dropzones, "state")).slice().sort()
    // this line just moves anything that's not a two-letter state to the end
    // essentially, just moving the "international" item to the bottom.
    return _.sortBy(sortedStates, (state) => (state.length > 2 ? 1 : 0))
  }, [dropzones])

  const renderItem = useCallback(({ item, index }) => {
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
            <Avatar.Image {...props} key={`state-image-${index}`} source={thisState.image} size={40} />
          ) : null
        }
        right={(props) => (
          <View style={themed($rightContainer)}>
            <Badge style={themed($badge)}>{groupByState[item].length}</Badge>
            <Icon name="chevron-right" size={16} style={themed($chevronRight)} />
          </View>
        )}
      />
    )
  }, [navigation, themed, groupByState])

  return (
    <FlatList
      style={themed(FULL)}
      removeClippedSubviews
      data={dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
})

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
