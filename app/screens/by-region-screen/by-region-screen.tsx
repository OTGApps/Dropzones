import { FunctionComponent, useMemo } from "react"
import { ViewStyle, FlatList } from "react-native"
import Icon from "@expo/vector-icons/FontAwesome"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { List } from "react-native-paper"

import { ListSeparator } from "@/components"
import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { useDropzonesByState } from "../../database"
import { States } from "../by-state-screen/states"

export interface ByRegionScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const ByRegionScreen: FunctionComponent<ByRegionScreenProps> = (props) => {
  const { stateGroups } = useDropzonesByState()
  const dataSource = useMemo(() => stateGroups.map((g) => g.stateCode), [stateGroups])
  const { themed } = useAppTheme()

  const renderItem = ({ item }: { item: string }) => (
    <List.Item
      title={item}
      onPress={() =>
        props.navigation.navigate("list-detail", {
          item,
          itemType: "state",
          title:
            States[item.toLowerCase() as keyof typeof States]?.fullName ??
            item.charAt(0).toUpperCase() + item.slice(1),
        })
      }
      right={(props) => (
        <Icon {...props} name="chevron-right" size={16} style={themed($chevronRight)} />
      )}
    />
  )

  return (
    <FlatList
      style={themed($full)}
      data={dataSource}
      keyExtractor={(item) => item}
      renderItem={renderItem}
      ItemSeparatorComponent={ListSeparator}
    />
  )
}

const $full: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})
