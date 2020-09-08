import React, { FunctionComponent as Component } from "react"
import { useNavigation } from "@react-navigation/native"
import { Dropzone } from "../../models"
import { ListItem } from "react-native-elements"

export interface DropzoneListRowProps {
  item: Dropzone
  index: number
  rightElement?: Record<string, any>
}

export const DropzoneListRow: Component<DropzoneListRowProps> = props => {
  const navigation = useNavigation()
  const { item, rightElement, index } = props

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
      <ListItem.Content>
        <ListItem.Title>{item.name}</ListItem.Title>
      </ListItem.Content>
      {rightElement}
      <ListItem.Chevron type="font-awesome" name="chevron-right" />
    </ListItem>
  )
}
