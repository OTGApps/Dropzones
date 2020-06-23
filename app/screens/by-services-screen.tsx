import React, { FunctionComponent as Component } from "react"
import { useStores } from '../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { color } from "../theme"
import { ListItem } from 'react-native-elements'

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}

const keyExtractor = (item, index) => index.toString()

export const ByServicesScreen: Component = observer(function ByServicesScreen() {
  const navigation = useNavigation()
  const { uniqueServices } = useStores()

  const renderItem = ({ item, index }) => <ListItem
    title={item}
    chevron
    bottomDivider={index < uniqueServices.length - 1}
    onPress={() => navigation.navigate('list-detail', {
      item,
      itemType: 'services',
      title: item
    })}
  />

  return (
    <FlatList
      style={FULL}
      data={uniqueServices}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
      // initialNumToRender={5}
      // maxToRenderPerBatch={5}
    />
  )
})
