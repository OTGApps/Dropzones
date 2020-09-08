import React, { FunctionComponent as Component, useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { Dropzone } from "../../models"
import { ListItem, Icon } from "react-native-elements"
import { useStores } from "../../models/root-store/root-store-context"
import _ from "lodash"
import { color } from "../../theme/color"
export interface DropzoneListRowProps {
  item: Dropzone
  index: number
  rightElement?: Record<string, any>
}

export const DropzoneListRow: Component<DropzoneListRowProps> = observer(props => {
  const navigation = useNavigation()
  const rootStore = useStores()
  const { flags } = rootStore
  const { item, rightElement, index } = props
  const isFlagged = _.includes(flags, item.anchor)
  const anchor = parseInt(item.anchor)
  const [flagged, setFlagged] = useState(isFlagged)

  useEffect(() => {
    flagged ? rootStore.removeFlag(anchor) : rootStore.addFlag(anchor)
  }, [flagged])

  const toggleFlag = () => {
    setFlagged(!flagged)
  }

  return (
    <ListItem
      bottomDivider
      key={"listItem-" + index}
      onPress={() =>
        navigation.navigate("dropzone-detail", {
          anchor: props.item.anchor,
          title: props.item.name,
        })
      }
    >
      <Icon
        {...props}
        type="font-awesome"
        color={color.primary}
        name={flagged ? "flag" : "flag-o"}
        onPress={toggleFlag}
      />
      <ListItem.Content>
        <ListItem.Title>{item.name}</ListItem.Title>
        <ListItem.Subtitle>{item.website}</ListItem.Subtitle>
      </ListItem.Content>
      {rightElement}
      <ListItem.Chevron type="font-awesome" name="chevron-right" />
    </ListItem>
  )
})
