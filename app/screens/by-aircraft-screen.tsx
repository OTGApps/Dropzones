import * as React from "react"
import { useStores } from '../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color } from "../theme"
import { ListItem } from 'react-native-elements'

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}

export interface ByAircraftScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const ByAircraftScreen: React.FunctionComponent<ByAircraftScreenProps> = props => {
  const { uniqueAircraft } = useStores()

  const renderItem = ({ item, index }) => <ListItem
    title={item}
    chevron
    bottomDivider={index < uniqueAircraft.length - 1}
    onPress={() => props.navigation.navigate('list-detail', {
      item,
      itemType: 'aircraft'
    })}
  />

  return (
    <FlatList
      style={FULL}
      data={uniqueAircraft}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
}
