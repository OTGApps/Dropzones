import { FunctionComponent } from "react"
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import _ from "lodash"
import { List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { $chevronRight } from "@/theme/styles"

import { useStores } from "../../models/root-store/root-store-context"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

export interface ByRegionScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const ByRegionScreen: FunctionComponent<ByRegionScreenProps> = (props) => {
  const { dropzones } = useStores()
  const dataSource = Object.keys(_.groupBy(dropzones, "state")).slice().sort()
  const { themed } = useAppTheme()

  const renderItem = ({ item }) => (
    <List.Item
      title={item}
      onPress={() =>
        props.navigation.navigate("list-detail", {
          item,
          itemType: "state",
        })
      }
      right={(props) => <Icon name="chevron-right" size={16} style={themed($chevronRight)} />}
    />
  )

  return (
    <FlatList
      style={themed(FULL)}
      data={dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
}
