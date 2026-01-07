import { FunctionComponent as Component } from "react"
import { ViewStyle, FlatList } from "react-native"
import { observer } from "mobx-react-lite"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { SpeedLimitSign, DropzoneListRow } from "../components"
import { useStores } from "../models/root-store/root-store-context"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

export interface NearMeScreenProps {
  route: any
}
const keyExtractor = (item, index) => index.toString()

export const NearMeScreen: Component = observer(function NearMeScreen(props) {
  const rootStore = useStores()
  const { route } = props as NearMeScreenProps
  const { location } = route.params // Get the location that was passed by the previous screen.
  const { themed } = useAppTheme()
  const sortedFromUser = rootStore.sortByDistanceFrom(location)

  const renderItem = ({ item, index }) => (
    <DropzoneListRow
      item={item}
      index={index}
      rightElement={<SpeedLimitSign km={item.distanceFromUser} />}
    />
  )

  return (
    <FlatList
      key="list"
      style={themed(FULL)}
      keyExtractor={keyExtractor}
      data={sortedFromUser}
      renderItem={renderItem}
      removeClippedSubviews
    />
  )
})
