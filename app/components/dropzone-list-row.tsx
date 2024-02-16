import React, { FunctionComponent as Component } from "react"
import { useNavigation } from "@react-navigation/native"
import { Dropzone } from "../models/dropzones"
import { ListItem } from "react-native-elements"
import { observer } from "mobx-react-lite"

export interface DropzoneListRowProps {
  item: Dropzone
  index: number
  rightElement?: Record<string, any>
  subtitle?: string
}

export const DropzoneListRow: Component<DropzoneListRowProps> = observer((props) => {
  const navigation = useNavigation()
  const { item, rightElement, index, subtitle } = props

  const pressed = () => {
    navigation.navigate("dropzone-detail", {
      anchor: props.item.anchor,
      title: props.item.name,
    })
  }

  return (
    <ListItem bottomDivider key={"listItem-" + index} onPress={pressed}>
      <ListItem.Content>
        <ListItem.Title>{item.name}</ListItem.Title>
        {subtitle && <ListItem.Subtitle>{subtitle}</ListItem.Subtitle>}
      </ListItem.Content>
      {rightElement}
      <ListItem.Chevron type="font-awesome" name="chevron-right" />
    </ListItem>
  )
})
