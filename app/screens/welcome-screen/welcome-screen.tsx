import * as React from "react"
import { ViewStyle, FlatList, Alert } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color, spacing } from "../../theme"
import { ListItem } from 'react-native-elements'
import Geolocation from '@react-native-community/geolocation'

const MenuItems = require('./menu-items.json')

const FULL: ViewStyle = {
  flex: 1,
}

export interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const WelcomeScreen: React.FunctionComponent<WelcomeScreenProps> = props => {
  Geolocation.setRNConfiguration({ skipPermissionRequests: false, authorizationLevel: 'whenInUse' })

  const openNearMeScreen = () => {
    Geolocation.getCurrentPosition(
      position => {
        console.tron.log('opening the near me screen.', JSON.stringify(position))
        props.navigation.navigate('near-me', {
          location: JSON.stringify(position)
        })
      },
      error => Alert.alert('Error', JSON.stringify(error)),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
    )
  }

  const renderItem = ({ item, index }) => <ListItem
    title={item.title}
    subtitle={item.subtitle}
    onPress={item.screen && (() => {
      if (item.screen === 'near-me') {
        openNearMeScreen()
      } else {
        props.navigation.navigate(item.screen)
      }
    })}
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
