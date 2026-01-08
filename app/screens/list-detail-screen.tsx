import { FC, useState, useCallback, useMemo } from "react"
import { ViewStyle, FlatList } from "react-native"
import { Searchbar } from "react-native-paper"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { DropzoneListRow, ListSeparator } from "../components"
import { useFilteredDropzones } from "../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

export interface ListDetailScreenProps {
  route: any
}
const keyExtractor = (_item, index) => index.toString()

export const ListDetailScreen: FC = function ListDetailScreen(props) {
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
    [],
  )

  const listHeader = useMemo(
    () => (
      <Searchbar
        key="list-search"
        placeholder="Search Dropzones..."
        value={search}
        onChangeText={(value) => setSearch(value)}
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        accessibilityLabel="Search dropzones"
        accessibilityHint="Filter the list of dropzones by name, location, or other details"
        accessibilityRole="search"
        style={themed(SEARCHBAR_STYLE)}
      />
    ),
    [search, themed],
  )

  return (
    <FlatList
      key="list"
      style={themed(FULL)}
      keyExtractor={keyExtractor}
      data={list}
      ListHeaderComponent={listHeader}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
      removeClippedSubviews
    />
  )
}
