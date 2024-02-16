import React, { FunctionComponent as Component, useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Dropzone } from "../models/dropzones"
import { View, ViewStyle, TextStyle, SectionList } from "react-native"
import { DropzoneListRow } from "../components"
import { colors, spacing } from "../theme"
import _ from "lodash"
import { SearchBar, Text } from "react-native-elements"
import { useStores } from "app/models"

const FULL: ViewStyle = {
  flex: 1,
}

const HEADER_STYLE: ViewStyle = {
  flex: 1,
  backgroundColor: colors.primary,
}
const HEADER_TEXT_STYLE: TextStyle = {
  color: colors.palette.white,
  margin: spacing.md,
  fontWeight: "bold",
}

const HeaderView = ({ section: { title } }) => {
  return (
    <View style={HEADER_STYLE}>
      <Text style={HEADER_TEXT_STYLE}>{title}</Text>
    </View>
  )
}

export const AlphabeticalScreen: Component = observer(function AlphabeticalScreen() {
  const { dropzones } = useStores()
  const [search, setSearch] = useState("")
  const [list, setList] = useState<Dropzone[]>(dropzones)

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

  const renderItem = ({ item, index }) => <DropzoneListRow item={item as Dropzone} index={index} />

  return (
    <SectionList
      removeClippedSubviews
      style={FULL}
      sections={dataSource}
      extraData={dropzones}
      stickySectionHeadersEnabled
      keyExtractor={(item) => item}
      renderSectionHeader={HeaderView}
      renderItem={renderItem}
      ListHeaderComponent={
        <SearchBar
          key="list-search"
          placeholder="Search Dropzones..."
          lightTheme
          value={search}
          onChangeText={setSearch}
        />
      }
    />
  )
})
