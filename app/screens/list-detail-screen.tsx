import { FunctionComponent as Component, useEffect, useState, useCallback } from "react"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { Searchbar } from "react-native-paper"

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

  const renderItem = useCallback(
    ({ item, index }) => <DropzoneListRow item={item} index={index} />,
    []
  )

  return (
    <FlatList
      key="list"
      style={themed(FULL)}
      keyExtractor={keyExtractor}
      data={list}
      ListHeaderComponent={
        <Searchbar
          key="list-search"
          placeholder="Search Dropzones..."
          value={search}
          onChangeText={(value) => setSearch(value)}
        />
      }
      renderItem={renderItem}
      removeClippedSubviews
    />
  )
})
