import * as React from "react"
import { useStores } from '../../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color } from "../../theme"
import { ListItem } from 'react-native-elements'
import { States } from './states'
import FastImage from 'react-native-fast-image'
import _ from 'lodash'

const unitedNationsFlag = require('./flags/united-nations.png')

console.tron.log('states', States)

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}

export interface ByStateScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const ByStateScreen: React.FunctionComponent<ByStateScreenProps> = props => {
  const rootStore = useStores()
  const { dropzones } = rootStore
  const sortedStates = Object.keys(_.groupBy(dropzones, 'state')).sort()

  // Count the number of dropzones per state BEFORE rendering. this greatly reduces the load time of the page.
  const stateCount = rootStore.stateCount()

  // this line just moves anything that's not a two-letter state to the end
  // essentially, just moving the "international" item to the bottom.
  const dataSource = _.sortBy(sortedStates, (state) => state.length > 2 ? 1 : 0)

  const renderItem = ({ item, index }) => {
    const thisState = States[item.toLowerCase()]
    return (
      <ListItem
        title={(thisState && thisState.fullName) || 'International'}
        leftAvatar={{
          // @ts-ignore
          ImageComponent: FastImage,
          title: (thisState && item),
          source: (thisState ? thisState.image : unitedNationsFlag),
          overlayContainerStyle: { borderWidth: 2 }
        }}
        rightAvatar={{
          title: stateCount[item].length.toString(),
          rounded: true,
          placeholderStyle: {
            backgroundColor: color.primaryLighter
          },
          source: {} // TODO investigate why Avatar won't render without the source prop for some reason
        }}
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
