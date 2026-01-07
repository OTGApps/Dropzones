import { FunctionComponent as Component, useEffect, useState } from "react"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { SearchBar } from "react-native-elements"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { DropzoneListRow } from "../components"
import { useStores } from "../models/root-store/root-store-context"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

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
  const { themed } = useAppTheme()

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
      style={themed(FULL)}
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
