import { FunctionComponent as Component, useState, useEffect, useCallback } from "react"
import { View, ViewStyle, TextStyle, SectionList } from "react-native"
import _ from "lodash"
import { observer } from "mobx-react-lite"
import { SearchBar, Text } from "react-native-elements"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { DropzoneListRow } from "../components"
import { Dropzone } from "../models/dropszones/dropzones"
import { useStores } from "../models/root-store/root-store-context"

const FULL: ViewStyle = {
  flex: 1,
}

const HEADER_STYLE: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const HEADER_TEXT_STYLE: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.neutral100,
  margin: spacing.sm,
  fontWeight: "bold",
})

const HeaderView = ({ section: { title } }) => {
  const { themed } = useAppTheme()
  return (
    <View style={themed(HEADER_STYLE)}>
      <Text style={themed(HEADER_TEXT_STYLE)}>{title}</Text>
    </View>
  )
}

export const AlphabeticalScreen: Component = observer(function AlphabeticalScreen() {
  const { dropzones } = useStores()
  const [search, setSearch] = useState("")
  const [list, setList] = useState<Dropzone[]>(dropzones)
  const { themed } = useAppTheme()

  useEffect(() => {
    const filteredData = search
      ? dropzones.filter(({ searchableText }) => {
          return searchableText.includes(search.toLowerCase())
        })
      : dropzones
    setList(filteredData)
  }, [search])

  // groupBy to extract section headers
  let dataSource = _.groupBy(list, "nameFirstLetter") // <- This is just the first letter of the name.
  // reduce to generate new array
  dataSource = _.reduce(
    dataSource,
    (acc, next, index) => {
      acc.push({
        title: index,
        data: next,
      })
      return acc
    },
    [],
  )

  const renderItem = useCallback(
    ({ item, index }) => <DropzoneListRow item={item as Dropzone} index={index} />,
    [],
  )

  const listHeader = useCallback(() => {
    return (
      <SearchBar
        key="list-search"
        placeholder="Search Dropzones..."
        lightTheme
        value={search}
        onChangeText={setSearch}
      />
    )
  }, [search])

  return (
    <SectionList
      removeClippedSubviews
      style={themed(FULL)}
      sections={dataSource}
      extraData={dropzones}
      stickySectionHeadersEnabled
      keyExtractor={(item) => item}
      renderSectionHeader={HeaderView}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
    />
  )
})
