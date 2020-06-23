import React, { FunctionComponent as Component } from "react"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { Dropzone } from "../../models"
import { ListItem } from 'react-native-elements'
import { useStores } from '../../models/root-store/root-store-context'
import _ from 'lodash'

export interface DropzoneListRowProps {
  item: Dropzone,
  index: number,
  isLast?: boolean,
  rightElement?: Record<string, any>
}

export const DropzoneListRow: Component<DropzoneListRowProps> = observer(props => {
  const navigation = useNavigation()
  const rootStore = useStores()
  const { flags } = rootStore
  const { item, rightElement, isLast, index } = props
  const isFlagged = _.includes(flags, item.anchor)
  const anchor = parseInt(item.anchor)

  const toggleFlag = () => {
    if (__DEV__) console.tron.log('toggle flag. isFlagged', isFlagged)
    isFlagged ? rootStore.removeFlag(anchor) : rootStore.addFlag(anchor)
  }

  return (
    <ListItem
      key={'listItem-' + index}
      title={item.name}
      subtitle={item.website}
      bottomDivider={!isLast}
      onPress={() => navigation.navigate('dropzone-detail', {
        anchor: props.item.anchor,
        title: props.item.name,
      })}
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
})

