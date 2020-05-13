import * as React from "react"
import { useStores } from '../../models/root-store/root-store-context'
import { View, ViewStyle, TextStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color, spacing } from "../../theme"
import { ListItem, Text } from 'react-native-elements'
import { States } from './states'
import FastImage from 'react-native-fast-image'
import _ from 'lodash'

const unitedNationsFlag = require('./flags/united-nations.png')

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}

const BADGE_CONTAINER: ViewStyle = {
  backgroundColor: color.primaryLighter,
  borderRadius: spacing[1],
}

const BADGE_TEST: TextStyle = {
  fontSize: 10,
  color: color.lightText,
  fontWeight: 'bold',
  margin: spacing[1]
}

export interface ByStateScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const ByStateScreen: React.FunctionComponent<ByStateScreenProps> = props => {
  const rootStore = useStores()
  const { dropzones } = rootStore
  const sortedStates = Object.keys(_.groupBy(dropzones, 'state')).sort()

  // Count the number of dropzones per state BEFORE rendering. this greatly reduces the load time of the page.
  const groupByState = rootStore.groupByState()

  // this line just moves anything that's not a two-letter state to the end
  // essentially, just moving the "international" item to the bottom.
  const dataSource = _.sortBy(sortedStates, (state) => state.length > 2 ? 1 : 0)

  const renderBadgeView = (count) => {
    return (
      <View style={BADGE_CONTAINER}>
        <Text style={BADGE_TEST}>
          {count.toString()}
        </Text>
      </View>
    )
  }

  const renderItem = ({ item, index }) => {
    const thisState = States[item.toLowerCase()]
    return (
      // @ts-ignore
      <ListItem
        title={(thisState && thisState.fullName) || 'International'}
        leftAvatar={{
          ImageComponent: FastImage,
          title: (thisState && item),
          source: (thisState ? thisState.image : unitedNationsFlag),
          overlayContainerStyle: { borderWidth: 1 }
        }}
        rightElement={() => renderBadgeView(groupByState[item].length)}
        chevron
        bottomDivider={index < dataSource.length - 1}
        onPress={() => props.navigation.navigate('list-detail', {
          item,
          itemType: 'state'
        })}
      />
    )
  }

  return (
    <FlatList
      style={FULL}
      removeClippedSubviews
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      data={dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
}
