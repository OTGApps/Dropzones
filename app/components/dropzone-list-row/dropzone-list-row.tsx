import { FunctionComponent as Component, useCallback } from "react"
import { useNavigation } from "@react-navigation/native"
import { List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { Dropzone } from "../../models/dropszones/dropzones"

export interface DropzoneListRowProps {
  item: Dropzone
  index: number
  rightElement?: Record<string, any>
  subtitle?: string
}

export const DropzoneListRow: Component<DropzoneListRowProps> = (props) => {
  const navigation = useNavigation()
  const { themed } = useAppTheme()
  const { item, rightElement, index, subtitle } = props

  const pressed = useCallback(() => {
    navigation.navigate("dropzone-detail", {
      anchor: props.item.anchor,
      title: props.item.name,
    })
  }, [navigation, props.item.anchor, props.item.name])

  return (
    <List.Item
      key={"listItem-" + index}
      title={item.name}
      description={subtitle}
      onPress={pressed}
      right={(props) => (
        <>
          {rightElement}
          <Icon name="chevron-right" size={16} style={themed($chevronRight)} />
        </>
      )}
    />
  )
}
