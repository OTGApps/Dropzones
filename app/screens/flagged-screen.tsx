import * as React from "react"
import { useStores } from '../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { DropzoneListRow } from "../components"

const FULL: ViewStyle = {
  flex: 1,
}

export interface FlaggedScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

const keyExtractor = (item, index) => index.toString()

export const FlaggedScreen: React.FunctionComponent<FlaggedScreenProps> = ({ navigation }) => {
  const { flaggedDropzones } = useStores()

  const renderItem = ({ item, index }) => <DropzoneListRow
    item={item}
    index={index}
    isLast={index < flaggedDropzones.length - 1}
    navigation={navigation}
  />

  return (
    <FlatList
      style={FULL}
      data={flaggedDropzones}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
      // initialNumToRender={5}
      // maxToRenderPerBatch={5}
    />
  )
}
