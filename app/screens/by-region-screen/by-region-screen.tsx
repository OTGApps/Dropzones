import { FunctionComponent } from "react"
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import _ from "lodash"
import { ListItem } from "react-native-elements"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

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
    <ListItem
      bottomDivider
      onPress={() =>
        props.navigation.navigate("list-detail", {
          item,
          itemType: "state",
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title>{item}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron type="font-awesome" name="chevron-right" />
    </ListItem>
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
