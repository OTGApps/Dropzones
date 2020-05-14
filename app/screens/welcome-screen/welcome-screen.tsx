import React, { useState } from "react"
import { observer } from 'mobx-react-lite'
import { useStores } from '../../models/root-store/root-store-context'
import { ViewStyle, FlatList, Alert, ActivityIndicator } from "react-native"
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

  // This boolean state is used when getting a user's location.
  // It disables all the rows from interaction and shows a loading icon
  // on the near-me menu item.
  const [loading, setLoading] = useState(false)

  const openNearMeScreen = () => {
    setLoading(true)
    Geolocation.getCurrentPosition(
      position => {
        setLoading(false)
        if (__DEV__) console.tron.log('opening the near me screen.', JSON.stringify(position))
        props.navigation.navigate('near-me', {
          location: JSON.stringify(position)
        })
      },
      error => {
        setLoading(false)
        Alert.alert('Error', JSON.stringify(error))
      },
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

  const renderChevron = (i) => {
    if (i.screen === 'near-me' && loading) {
      return <ActivityIndicator />
    } else {
      return !!i.screen // returns true if there's a screen defined in the json file.
    }
  }

  const renderItem = ({ item, index }) => <ListItem
    title={item.title}
    subtitle={item.subtitle}
    onPress={item.screen && (() => {
      switch (item.screen) {
        case 'near-me':
          openNearMeScreen()
          break
        default:
          props.navigation.navigate(item.screen)
          break
      }
    })}
    disabled={loading || !item.screen}
    chevron={renderChevron(item)}
    bottomDivider={index < MenuItems.length - 1}
    leftIcon={{
      color: color.primary,
      name: item.iconName,
      type: 'font-awesome'
    }}
    rightElement={rightElement(item)}
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
