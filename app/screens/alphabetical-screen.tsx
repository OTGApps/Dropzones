import * as React from "react"
import { useStores } from '../models/root-store/root-store-context'
import { View, ViewStyle, SectionList, TextStyle } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { Text } from "../components"
import { color, spacing } from "../theme"
import _ from 'lodash'
import { ListItem } from 'react-native-elements'

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

export const AlphabeticalScreen: React.FunctionComponent<AlphabeticalScreenProps> = props => {
  const { dropzones } = useStores()

  const HeaderView = ({ section: { title } }) => {
    return (
      <View style={HEADER_STYLE}>
        <Text style={HEADER_TEXT_STYLE}>{title}</Text>
      </View>
    )
  }

  // groupBy to extract section headers
  let dataSource = _.groupBy(dropzones, 'nameFirstLetter') // <- This is just the first letter of the name.

  // reduce to generate new array
  dataSource = _.reduce(dataSource, (acc, next, index) => {
    acc.push({
      title: index,
      data: next
    })
    return acc
  }, [])

  const renderItem = ({ item, index }) => <ListItem
    title={item.name}
    subtitle={item.website}
    bottomDivider={index < dataSource.length - 1}
    chevron
    onPress={() => props.navigation.navigate('dropzone-detail', { item: JSON.stringify(item) })}
  />

  return (
    <SectionList
      style={FULL}
      sections={dataSource}
      extraData={dropzones}
      stickySectionHeadersEnabled
      keyExtractor={(item, idx) => idx.toString()}
      renderSectionHeader={HeaderView}
      renderItem={renderItem}
    />
  )
}
