import { FunctionComponent as Component } from "react"
import { ViewStyle, FlatList, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import _ from "lodash"
import { observer } from "mobx-react-lite"
import { List, Avatar, Badge } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

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
  const sortedStates = Object.keys(_.groupBy(dropzones, "state")).slice().sort()
  const { themed } = useAppTheme()

  // Count the number of dropzones per state BEFORE rendering. this greatly reduces the load time of the page.
  const groupByState = rootStore.groupByState()

  // this line just moves anything that's not a two-letter state to the end
  // essentially, just moving the "international" item to the bottom.
  const dataSource = _.sortBy(sortedStates, (state) => (state.length > 2 ? 1 : 0))

  const renderItem = ({ item, index }) => {
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
            <Badge style={{ marginRight: 8, alignSelf: "center", fontSize: 14 }}>{groupByState[item].length}</Badge>
            <Icon name="chevron-right" size={16} color="#666" style={{ alignSelf: "center" }} />
          </View>
        )}
      />
    )
  }

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
