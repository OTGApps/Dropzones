import React, { useEffect, useState } from "react"
import { useStores } from '../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color } from "../theme"
import { SearchBar, ListItem } from 'react-native-elements'

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}

export interface ListDetailScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
  route: any
}
const keyExtractor = (item, index) => index.toString()

export const ListDetailScreen: React.FunctionComponent<ListDetailScreenProps> = ({ route, navigation }) => {
  const rootStore = useStores()
  const { item, itemType } = route.params
  const dropzones = rootStore.filteredDropzones(item, itemType)
  const [search, setSearch] = useState('')
  const [list, setList] = useState(dropzones)

  useEffect(() => {
    const filteredData = search ? dropzones.filter(({ searchableText }) => {
      return searchableText.includes(search.toLowerCase())
    }) : dropzones
    setList(filteredData)
  }, [search])

  const renderItem = ({ item, index }) => <ListItem
    title={item.name}
    subtitle={item.website}
    chevron
    bottomDivider={index < list.length - 1}
    onPress={() => navigation.navigate('dropzone-detail', { item: JSON.stringify(item) })}
  />

  return (
    <FlatList
      key='list'
      style={FULL}
      keyExtractor={keyExtractor}
      data={list}
      ListHeaderComponent={<SearchBar
        key='list-search'
        placeholder="Search Dropzones..."
        lightTheme
        value={search}
        onChangeText={value => setSearch(value)}
      />}
      renderItem={renderItem}
    />
  )
}
