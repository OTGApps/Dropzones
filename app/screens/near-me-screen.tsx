import React, { FunctionComponent as Component } from "react"
import { useStores } from "../models/root-store/root-store-context"
import { ViewStyle, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import { color } from "../theme"
import { SpeedLimitSign, DropzoneListRow } from "../components"

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background,
}

export interface NearMeScreenProps {
  route: any
}
const keyExtractor = (item, index) => index.toString()

export const NearMeScreen: Component = observer(function NearMeScreen(props) {
  const rootStore = useStores()
  const { route } = props as NearMeScreenProps
  const { location } = route.params // Get the location that was passed by the previous screen.
  const l: any = JSON.parse(location) // un-stringify it from the previous screen.

  const sortedFromUser = rootStore.sortByDistanceFrom(l)

  const renderItem = ({ item, index }) => (
    <DropzoneListRow
      item={item}
      index={index}
      rightElement={
        <SpeedLimitSign
          distanceFromUser={(parseInt(item.distanceFromUser) * 0.621371).toString()}
        />
      }
    />
  )

  return (
    <FlatList
      key="list"
      style={FULL}
      keyExtractor={keyExtractor}
      data={sortedFromUser}
      renderItem={renderItem}
      removeClippedSubviews
    />
  )
})
