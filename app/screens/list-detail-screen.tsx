import { FunctionComponent as Component, useEffect, useState, useCallback, useMemo } from "react"
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Searchbar } from "react-native-paper"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { DropzoneListRow } from "../components"
import { useFilteredDropzones, type Dropzone } from "../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

export interface ListDetailScreenProps {
  route: any
}
const keyExtractor = (item, index) => index.toString()

export const ListDetailScreen: Component = function ListDetailScreen(props) {
  const navigation = useNavigation()
  const { route } = props as ListDetailScreenProps
  const { item, itemType } = route.params
  const { dropzones } = useFilteredDropzones(item, itemType)
  const [search, setSearch] = useState("")
  const { themed } = useAppTheme()

  // Filter dropzones based on search
  const list = useMemo(() => {
    if (!search) return dropzones
    return dropzones.filter(({ searchableText }) => {
      return searchableText.includes(search.toLowerCase())
    })
  }, [dropzones, search])

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
}
