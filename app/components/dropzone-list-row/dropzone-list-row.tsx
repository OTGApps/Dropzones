import { FC, useCallback, memo } from "react"
import { useNavigation } from "@react-navigation/native"
import { List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"

import type { Dropzone } from "../../database"

export interface DropzoneListRowProps {
  item: Dropzone
  index: number
  rightElement?: Record<string, any>
  subtitle?: string
}

const DropzoneListRowComponent: FC<DropzoneListRowProps> = (props) => {
  const navigation = useNavigation()
  const { themed } = useAppTheme()
  const { item, rightElement, index, subtitle } = props

  const pressed = useCallback(() => {
    navigation.navigate(
      "dropzone-detail" as never,
      {
        anchor: props.item.anchor.toString(),
        title: props.item.name,
      } as never,
    )
  }, [navigation, props.item.anchor, props.item.name])

  // Generate subtitle from airport/country/state if not explicitly provided
  const displaySubtitle =
    subtitle ||
    [item.airport, [item.state, item.country].filter(Boolean).join(", ")]
      .filter(Boolean)
      .join(" • ")

  return (
    <List.Item
      key={"listItem-" + index}
      title={item.name}
      description={displaySubtitle || undefined}
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

// Wrap in memo with custom comparison to prevent unnecessary re-renders
export const DropzoneListRow = memo(DropzoneListRowComponent, (prevProps, nextProps) => {
  // Only re-render if the anchor changes (or other props that matter)
  return (
    prevProps.item.anchor === nextProps.item.anchor &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.rightElement === nextProps.rightElement
  )
})
