import React, { useEffect } from "react"
import { ListItem } from 'react-native-elements'
import { Dropzone } from "../../models/root-store"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { useStores } from '../../models/root-store/root-store-context'
import _ from 'lodash'

export interface DropzoneListRowProps {
  item: Dropzone,
  navigation: NativeStackNavigationProp<ParamListBase>,
  isLast?: boolean,
  rightElement?: Record<string, any>
}

export function DropzoneListRow(props: DropzoneListRowProps) {
  const rootStore = useStores()
  const { flags } = rootStore
  const { item, navigation, rightElement, isLast } = props
  const isFlagged = _.includes(flags, item.anchor)

  const toggleFlag = () => {
    if (__DEV__) console.tron.log('toggle flag. isFlagged', isFlagged)
    isFlagged ? rootStore.removeFlag(item.anchor) : rootStore.addFlag(item.anchor)
  }

  // useEffect(() => {
  // }, [flags])

  return (
    <ListItem
      title={item.name}
      subtitle={item.website}
      bottomDivider={!isLast}
      onPress={() => navigation.navigate('dropzone-detail', { item: JSON.stringify(props.item) })}
      // @ts-ignore
      rightElement={rightElement}
      leftIcon={{
        type: 'font-awesome',
        name: isFlagged ? 'flag' : 'flag-o',
        onPress: toggleFlag
      }}
      chevron
    />

  )
}
