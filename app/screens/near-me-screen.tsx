import * as React from "react"
import { useStores } from '../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color } from "../theme"
import { ListItem } from 'react-native-elements'
import { SpeedLimitSign, DropzoneListRow } from "../components"

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}


export interface NearMeScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
  route: any
}
const keyExtractor = (item, index) => index.toString()

export const NearMeScreen: React.FunctionComponent<NearMeScreenProps> = ({ route, navigation }) => {
  const rootStore = useStores()

  const { location } = route.params // Get the location that was passed by the previous screen.
  const l: any = JSON.parse(location) // un-stringify it from the previous screen.

  const sortedFromUser = rootStore.sortByDistanceFrom(l)

  const renderItem = ({ item, index }) => <DropzoneListRow
    item={item}
    index={index}
    isLast={index < sortedFromUser.length - 1}
    navigation={navigation}
    rightElement={() => <SpeedLimitSign distanceFromUser={
      parseInt(item.distanceFromUser * 0.621371).toString() || '🤷‍♂️'
    } />}
  />

  return (
    <FlatList
      key='list'
      style={FULL}
      keyExtractor={keyExtractor}
      data={sortedFromUser}
      renderItem={renderItem}
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={5}
    />
  )
}
