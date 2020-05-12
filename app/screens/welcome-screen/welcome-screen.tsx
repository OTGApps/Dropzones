import * as React from "react"
import { ViewStyle, FlatList } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color, spacing } from "../../theme"
import { ListItem } from 'react-native-elements'

const MenuItems = require('./menu-items.json')

const FULL: ViewStyle = {
  flex: 1,
}

export interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const WelcomeScreen: React.FunctionComponent<WelcomeScreenProps> = props => {
  const renderItem = ({ item, index }) => <ListItem
    title={item.title}
    subtitle={item.subtitle}
    onPress={item.screen && (() => props.navigation.navigate(item.screen))}
    disabled={!item.screen}
    chevron={!!item.screen}
    bottomDivider={index < MenuItems.length - 1}
    leftIcon={{
      color: color.primary,
      name: item.iconName,
      type: 'font-awesome'
    }}
  />

  return (
    <FlatList
      style={FULL}
      data={MenuItems}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
}
