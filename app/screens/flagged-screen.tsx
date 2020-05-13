import * as React from "react"
import { useStores } from '../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color } from "../theme"
import { ListItem } from 'react-native-elements'

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}

export interface FlaggedScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

const keyExtractor = (item, index) => index.toString()

export const FlaggedScreen: React.FunctionComponent<FlaggedScreenProps> = ({ navigation }) => {
  const { flaggedDropzones } = useStores()

  const renderItem = ({ item, index }) => <ListItem
    title={item.name}
    subtitle={item.website}
    chevron
    bottomDivider={index < flaggedDropzones.length - 1}
    onPress={() => navigation.navigate('dropzone-detail', { item: JSON.stringify(item) })}
  />

  return (
    <FlatList
      style={FULL}
      data={flaggedDropzones}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={5}
    />
  )
}
