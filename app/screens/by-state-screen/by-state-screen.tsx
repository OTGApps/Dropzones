import React, { FunctionComponent as Component } from "react"
import { useStores } from '../../models/root-store/root-store-context'
import { ViewStyle, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { color } from "../../theme"
import { ListItem } from 'react-native-elements'
import { States } from './states'
import FastImage from 'react-native-fast-image'
import { CountBadge } from "../../components"
import _ from 'lodash'

const unitedNationsFlag = require('./flags/united-nations.png')

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: color.background
}

export const ByStateScreen: Component = observer(function ByStateScreen() {
  const navigation = useNavigation()
  const rootStore = useStores()
  const { dropzones } = rootStore
  const sortedStates = Object.keys(_.groupBy(dropzones, 'state')).sort()

  // Count the number of dropzones per state BEFORE rendering. this greatly reduces the load time of the page.
  const groupByState = rootStore.groupByState()

  // this line just moves anything that's not a two-letter state to the end
  // essentially, just moving the "international" item to the bottom.
  const dataSource = _.sortBy(sortedStates, (state) => state.length > 2 ? 1 : 0)

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
        rightElement={() => <CountBadge count={groupByState[item].length} />}
        chevron
        bottomDivider={index < dataSource.length - 1}
        onPress={() => navigation.navigate('list-detail', {
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
      data={dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
      // initialNumToRender={5}
      // maxToRenderPerBatch={5}
    />
  )
})
