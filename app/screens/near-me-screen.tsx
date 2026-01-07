import { FC, useCallback } from "react"
import { ViewStyle, FlatList, View } from "react-native"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { SpeedLimitSign, DropzoneListRow } from "../components"
import { useNearbyDropzones } from "../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const SEPARATOR: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.palette.neutral300,
})

export interface NearMeScreenProps {
  route: any
}
const keyExtractor = (item, index) => index.toString()

export const NearMeScreen: FC = function NearMeScreen(props) {
  const { route } = props as NearMeScreenProps
  const { location } = route.params // Get the location that was passed by the previous screen.
  const { themed } = useAppTheme()
  const { dropzones: sortedFromUser } = useNearbyDropzones(location)

  const renderItem = useCallback(
    ({ item, index }) => (
      <DropzoneListRow
        item={item}
        index={index}
        rightElement={<SpeedLimitSign km={item.distanceFromUser} />}
      />
    ),
    [],
  )

  const renderSeparator = useCallback(() => <View style={themed(SEPARATOR)} />, [themed])

  return (
    <FlatList
      key="list"
      style={themed(FULL)}
      keyExtractor={keyExtractor}
      data={sortedFromUser}
      renderItem={renderItem}
      ItemSeparatorComponent={renderSeparator}
      removeClippedSubviews
    />
  )
}
