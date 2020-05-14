import React, { useState, useEffect } from "react"
import { useStores } from '../models/root-store/root-store-context'
import { Dropzone } from '../models/root-store/root-store'
import { View, ViewStyle, SectionList, TextStyle } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { DropzoneListRow } from "../components"
import { color, spacing } from "../theme"
import _ from 'lodash'
import { SearchBar, Text } from 'react-native-elements'

const FULL: ViewStyle = {
  flex: 1,
}

const HEADER_STYLE: ViewStyle = {
  flex: 1,
  backgroundColor: color.primary
}
const HEADER_TEXT_STYLE: TextStyle = {
  fontSize: 20,
  color: color.palette.white,
  margin: spacing[2],
  fontWeight: 'bold'
}

export interface AlphabeticalScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const AlphabeticalScreen: React.FunctionComponent<AlphabeticalScreenProps> = ({ navigation }) => {
  const { dropzones } = useStores()
  const [search, setSearch] = useState('')
  const [list, setList] = useState<Dropzone[]>(dropzones)

  useEffect(() => {
    const filteredData = search ? dropzones.filter(({ searchableText }) => {
      return searchableText.includes(search.toLowerCase())
    }) : dropzones
    setList(filteredData)
  }, [search])

  const HeaderView = ({ section: { title } }) => {
    return (
      <View style={HEADER_STYLE}>
        <Text style={HEADER_TEXT_STYLE}>{title}</Text>
      </View>
    )
  }

  // groupBy to extract section headers
  let dataSource = _.groupBy(list, 'nameFirstLetter') // <- This is just the first letter of the name.
  // reduce to generate new array
  dataSource = _.reduce(dataSource, (acc, next, index) => {
    acc.push({
      title: index,
      data: next
    })
    return acc
  }, [])

  const renderItem = ({ item, index }) => <DropzoneListRow
    item={item}
    index={index}
    isLast={index < dataSource.length - 1}
    navigation={navigation}
  />

  return (
    <SectionList
      style={FULL}
      sections={dataSource}
      extraData={dropzones}
      stickySectionHeadersEnabled
      keyExtractor={(item, idx) => idx.toString()}
      // @ts-ignore
      renderSectionHeader={HeaderView}
      renderItem={renderItem}
      ListHeaderComponent={<SearchBar
        key='list-search'
        placeholder="Search Dropzones..."
        lightTheme
        value={search}
        onChangeText={value => setSearch(value)}
      />}

    />
  )
}
