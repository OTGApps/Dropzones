import { FunctionComponent as Component, useState, useEffect, useCallback, useMemo } from "react"
import { View, ViewStyle, TextStyle, SectionList, Text } from "react-native"
import _ from "lodash"
import { observer } from "mobx-react-lite"
import { Searchbar } from "react-native-paper"

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
  backgroundColor: colors.palette.neutral300,
})

const HEADER_TEXT_STYLE: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.neutral900,
  margin: spacing.sm,
  fontWeight: "bold",
})

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

  // groupBy to extract section headers and reduce to generate new array
  // Memoized to prevent recalculation on every render
  const dataSource = useMemo(() => {
    const grouped = _.groupBy(list, "nameFirstLetter") // <- This is just the first letter of the name.
    return _.reduce(
      grouped,
      (acc, next, index) => {
        acc.push({
          title: index,
          data: next,
        })
        return acc
      },
      [],
    )
  }, [list])

  const renderItem = useCallback(
    ({ item, index }) => <DropzoneListRow item={item as Dropzone} index={index} />,
    [],
  )

  const listHeader = useCallback(() => {
    return (
      <Searchbar
        key="list-search"
        placeholder="Search Dropzones..."
        value={search}
        onChangeText={setSearch}
      />
    )
  }, [search])

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
      style={themed(FULL)}
      sections={dataSource}
      extraData={dropzones}
      stickySectionHeadersEnabled
      keyExtractor={(item) => item.anchor.toString()}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
    />
  )
})
