import { FC, useState, useCallback, useMemo } from "react"
import { View, ViewStyle, TextStyle, SectionList, Text } from "react-native"
import { Searchbar } from "react-native-paper"

import { useAppTheme } from "@/theme/context"
import { $searchbar } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { DropzoneListRow, ListEmpty, ListSeparator } from "../components"
import { useDropzoneSearch, type Dropzone } from "../database"

export const AlphabeticalScreen: FC = function AlphabeticalScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const { results: dropzones, search } = useDropzoneSearch()
  const { themed } = useAppTheme()

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text)
      search(text)
    },
    [search],
  )

  const dataSource = useMemo(() => {
    const grouped: Record<string, Dropzone[]> = {}
    for (const dz of dropzones) {
      const letter = dz.nameFirstLetter
      if (!grouped[letter]) {
        grouped[letter] = []
      }
      grouped[letter].push(dz)
    }
    return Object.entries(grouped).map(([title, data]) => ({ title, data }))
  }, [dropzones])

  const renderItem = useCallback(
    ({ item, index }) => <DropzoneListRow item={item as Dropzone} index={index} />,
    [],
  )

  const listHeader = useMemo(
    () => (
      <Searchbar
        placeholder="Search Dropzones..."
        value={searchQuery}
        onChangeText={handleSearch}
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        accessibilityLabel="Search dropzones"
        accessibilityHint="Filter the list of dropzones by name, location, or other details"
        accessibilityRole="search"
        style={themed($searchbar)}
      />
    ),
    [searchQuery, handleSearch, themed],
  )

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => (
      <View style={themed($headerStyle)}>
        <Text style={themed($headerTextStyle)}>{title}</Text>
      </View>
    ),
    [themed],
  )

  return (
    <SectionList
      style={$full}
      sections={dataSource}
      extraData={dropzones}
      stickySectionHeadersEnabled
      keyExtractor={(item) => item.anchor.toString()}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={<ListEmpty />}
    />
  )
}

const $full: ViewStyle = {
  flex: 1,
}

const $headerStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral300,
})

const $headerTextStyle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.neutral900,
  margin: spacing.sm,
  fontWeight: "bold",
})
