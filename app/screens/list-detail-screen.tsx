import React, { FunctionComponent as Component, useEffect, useState } from "react"
import { useStores } from "app/models"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { colors } from "../theme"
import { SearchBar } from "react-native-elements"
import { DropzoneListRow } from "../components"

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

export interface ListDetailScreenProps {
  route: any
}
const keyExtractor = (item, index) => index.toString()

export const ListDetailScreen: Component = observer(function ListDetailScreen(props) {
  const navigation = useNavigation()
  const rootStore = useStores()
  const { route } = props as ListDetailScreenProps
  const { item, itemType } = route.params
  const dropzones = rootStore.filteredDropzones(item, itemType)
  const [search, setSearch] = useState("")
  const [list, setList] = useState(dropzones)

  useEffect(() => {
    const filteredData = search
      ? dropzones.filter(({ searchableText }) => {
          return searchableText.includes(search.toLowerCase())
        })
      : dropzones
    setList(filteredData)
  }, [search])

  const renderItem = ({ item, index }) => <DropzoneListRow item={item} index={index} />

  return (
    <FlatList
      key="list"
      style={FULL}
      keyExtractor={keyExtractor}
      data={list}
      ListHeaderComponent={
        <SearchBar
          key="list-search"
          placeholder="Search Dropzones..."
          lightTheme
          value={search}
          onChangeText={(value) => setSearch(value)}
        />
      }
      renderItem={renderItem}
      removeClippedSubviews
    />
  )
})
