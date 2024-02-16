import React, { FunctionComponent as Component } from "react"
import { useStores } from "app/models"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { colors } from "../../theme"
import { ListItem, Avatar } from "react-native-elements"
import { States } from "./states"
import { CountBadge } from "../../components"
import _ from "lodash"

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

export const ByStateScreen: Component = observer(function ByStateScreen() {
  const navigation = useNavigation()
  const rootStore = useStores()
  const { dropzones } = rootStore
  const sortedStates = Object.keys(_.groupBy(dropzones, "stateOrInternational")).slice().sort()

  // Count the number of dropzones per state BEFORE rendering. this greatly reduces the load time of the page.
  const groupByState = rootStore.groupByState()

  // this line just moves anything that's not a two-letter state to the end
  // essentially, just moving the "international" item to the bottom.
  const dataSource = _.sortBy(sortedStates, (state) => (state.length > 2 ? 1 : 0))

  const renderItem = ({ item, index }) => {
    const thisState = States[item]

    return (
      <ListItem
        bottomDivider
        onPress={() =>
          navigation.navigate("list-detail", {
            item,
            itemType: "state",
            title: States[item].fullName,
          })
        }
      >
        {thisState && (
          <Avatar
            rounded
            key={`state-image-${index}`}
            title={item}
            source={thisState.image}
            overlayContainerStyle={{ borderWidth: 1 }}
          />
        )}
        <ListItem.Content>
          <ListItem.Title>{thisState && thisState.fullName}</ListItem.Title>
        </ListItem.Content>
        <CountBadge count={groupByState[item].length} />
        <ListItem.Chevron type="font-awesome" name="chevron-right" />
      </ListItem>
    )
  }

  return (
    <FlatList
      style={FULL}
      removeClippedSubviews
      data={dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
})
