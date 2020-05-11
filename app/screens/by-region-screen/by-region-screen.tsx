import * as React from "react"
import { useStores } from '../../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color } from "../../theme"
import _ from 'lodash'
import { ListItem } from 'react-native-elements'

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}

export interface ByRegionScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const ByRegionScreen: React.FunctionComponent<ByRegionScreenProps> = props => {
  const { dropzones } = useStores()
  const dataSource = Object.keys(_.groupBy(dropzones, 'state')).sort()

  const renderItem = ({ item, index }) => <ListItem
    title={item}
    chevron
    bottomDivider={index < dataSource.length - 1}
    onPress={() => props.navigation.navigate('list-detail', {
      item,
      itemType: 'state'
    })}
  />

  return (
    <FlatList
      style={FULL}
      data={dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
}
