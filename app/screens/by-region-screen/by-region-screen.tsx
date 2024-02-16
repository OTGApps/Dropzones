import * as React from "react"
import { useStores } from "app/models"
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { colors } from "../../theme"
import _ from "lodash"
import { ListItem } from "react-native-elements"

const FULL: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

export interface ByRegionScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const ByRegionScreen: React.FunctionComponent<ByRegionScreenProps> = (props) => {
  const { dropzones } = useStores()
  const dataSource = Object.keys(_.groupBy(dropzones, "state")).slice().sort()

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
      style={FULL}
      data={dataSource}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
}
