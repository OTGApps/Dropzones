import React, { useState, useEffect } from "react"
import { useStores } from '../models/root-store/root-store-context'
import { Dropzone } from '../models/root-store/root-store'
import { View, ViewStyle, TextStyle, SectionList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { DropzoneListRow } from "../components"
import { color, spacing } from "../theme"
import _ from 'lodash'
import { SearchBar, Text } from 'react-native-elements'
// import SectionList from 'react-native-tabs-section-list'
// import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'

const FULL: ViewStyle = {
  flex: 1,
}

const HEADER_STYLE: ViewStyle = {
  flex: 1,
  backgroundColor: color.primary
}
const HEADER_TEXT_STYLE: TextStyle = {
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

  // const getItemLayout = sectionListGetItemLayout({
  //   // The height of the row with rowData at the given sectionIndex and rowIndex
  //   getItemHeight: (rowData, sectionIndex, rowIndex) => 67,

  //   // These three properties are optional
  //   getSectionHeaderHeight: () => 33, // The height of your section headers
  //   getSectionFooterHeight: () => 0, // The height of your section footers
  // })

  return (
    <SectionList
      style={FULL}
      // getItemLayout={getItemLayout}
      sections={dataSource}
      extraData={dropzones}
      stickySectionHeadersEnabled
      // onScrollToIndexFailed={() => { }}
      keyExtractor={(item) => item}
      // renderTab={({ title, isActive }) => (
      //   <View style={{ backgroundColor: isActive ? color.primaryLighter : color.background }}>
      //     <Text
      //       style={[
      //         {
      //           padding: spacing[3],
      //           color: color.dim,
      //           fontSize: 18,
      //         },
      //         { color: isActive ? color.palette.white : '#9e9e9e' }
      //       ]}
      //     >
      //       {title}
      //     </Text>
      //   </View>
      // )}
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
