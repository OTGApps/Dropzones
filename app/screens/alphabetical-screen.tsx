import { FunctionComponent as Component, useState, useCallback, useMemo } from "react"
import { View, ViewStyle, TextStyle, SectionList, Text } from "react-native"
import { Searchbar } from "react-native-paper"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { DropzoneListRow } from "../components"
import { useDropzoneSearch, type Dropzone } from "../database"

const FULL: ViewStyle = {
  flex: 1,
}

const HEADER_STYLE: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral300,
})

const HEADER_TEXT_STYLE: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.neutral900,
  margin: spacing.sm,
  fontWeight: "bold",
})

export const AlphabeticalScreen: Component = function AlphabeticalScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const { results: dropzones, search } = useDropzoneSearch()
  const { themed } = useAppTheme()

  // Handle search input
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text)
    search(text)
  }, [search])

  // groupBy to extract section headers and reduce to generate new array
  // Memoized to prevent recalculation on every render
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

  const listHeader = useCallback(() => {
    return (
      <Searchbar
        key="list-search"
        placeholder="Search Dropzones..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
    )
  }, [handleSearch])

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => (
      <View style={themed(HEADER_STYLE)}>
        <Text style={themed(HEADER_TEXT_STYLE)}>{title}</Text>
      </View>
    ),
    [themed],
  )

  return (
    <SectionList
      removeClippedSubviews
      style={FULL}
      sections={dataSource}
      extraData={dropzones}
      stickySectionHeadersEnabled
      keyExtractor={(item) => item.anchor.toString()}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
    />
  )
}
