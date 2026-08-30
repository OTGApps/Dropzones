import { FC, useCallback } from "react"
import { ViewStyle, FlatList } from "react-native"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { SpeedLimitSign, DropzoneListRow, ListEmpty, ListSeparator } from "../components"
import { useNearbyDropzones, type DropzoneWithDistance } from "../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

export interface NearMeScreenProps {
  route: any
}
const keyExtractor = (_item: DropzoneWithDistance, index: number) => index.toString()

export const NearMeScreen: FC = function NearMeScreen(props) {
  const { route } = props as NearMeScreenProps
  const { location } = route.params // Get the location that was passed by the previous screen.
  const { themed } = useAppTheme()
  const { dropzones: sortedFromUser } = useNearbyDropzones(location)

  const renderItem = useCallback(
    ({ item, index }: { item: DropzoneWithDistance; index: number }) => (
      <DropzoneListRow
        item={item}
        index={index}
        rightElement={<SpeedLimitSign km={item.distanceFromUser} />}
      />
    ),
    [],
  )

  return (
    <FlatList
      key="list"
      style={themed(FULL)}
      keyExtractor={keyExtractor}
      data={sortedFromUser}
      ListEmptyComponent={<ListEmpty message="No dropzones found nearby" />}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
    />
  )
}
