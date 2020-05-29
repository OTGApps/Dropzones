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

export interface ByTrainingScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

const keyExtractor = (item, index) => index.toString()

const TRAINING_TITLES = {
  iad: "Instructor Assisted Deployment",
  aff: "Assisted Free Fall",
  sl: "Static Line",
  tandem: "Tandem"
}

export const ByTrainingScreen: React.FunctionComponent<ByTrainingScreenProps> = props => {
  const { uniqueTraining } = useStores()

  const renderItem = ({ item, index }) => <ListItem
    title={TRAINING_TITLES[item.toLowerCase()]}
    chevron
    bottomDivider={index < uniqueTraining.length - 1}
    onPress={() => props.navigation.navigate('list-detail', {
      item,
      itemType: 'training',
      title: TRAINING_TITLES[item.toLowerCase()]
    })}
  />

  return (
    <FlatList
      style={FULL}
      data={uniqueTraining}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      removeClippedSubviews
      // initialNumToRender={5}
      // maxToRenderPerBatch={5}
    />
  )
}
