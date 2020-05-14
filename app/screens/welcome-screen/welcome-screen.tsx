import * as React from "react"
import { observer } from 'mobx-react-lite'
import { useStores } from '../../models/root-store/root-store-context'
import { ViewStyle, FlatList, Alert } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color } from "../../theme"
import { CountBadge } from '../../components'
import { ListItem } from 'react-native-elements'
import Geolocation from '@react-native-community/geolocation'

const MenuItems = require('./menu-items.json')

const FULL: ViewStyle = {
  flex: 1,
}

export interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

export const WelcomeScreen = observer(function WelcomeScreen(props: WelcomeScreenProps) {
  Geolocation.setRNConfiguration({ skipPermissionRequests: false, authorizationLevel: 'whenInUse' })
  const { flags } = useStores()

  const openNearMeScreen = () => {
    Geolocation.getCurrentPosition(
      position => {
        if (__DEV__) console.tron.log('opening the near me screen.', JSON.stringify(position))
        props.navigation.navigate('near-me', {
          location: JSON.stringify(position)
        })
      },
      error => Alert.alert('Error', JSON.stringify(error)),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
    )
  }

  const rightElement = (item) => {
    switch (item.screen) {
      case 'flagged':
        return (<CountBadge count={flags.length} />)
      default:
        return null
    }
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
    rightElement={() => rightElement(item)}
  />

  return (
    <FlatList
      style={FULL}
      data={MenuItems}
      keyExtractor={(item, idx) => idx.toString()}
      renderItem={renderItem}
    />
  )
})
