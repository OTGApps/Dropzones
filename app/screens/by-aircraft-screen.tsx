import { FunctionComponent as Component, useState, useEffect } from "react"
import { ViewStyle, SectionList, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { Button, Card, ListItem, Text } from "react-native-elements"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { useStores } from "../models/root-store/root-store-context"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const keyExtractor = (item, index) => index.toString()
const HIDE_HEADER_COMPONENT_KEY = "@aircraftHasSeenWarning"

export const ByAircraftScreen: Component = observer(function ByAircraftScreen() {
  const navigation = useNavigation()
  const { uniqueAircraftSorted } = useStores()
  const [headerHidden, setHeaderHidden] = useState<boolean | null>(null)
  const { themed } = useAppTheme()

  useEffect(() => {
    let isMounted = true
    const showDisclaimerAlert = async () => {
      const headerAsyncData = await AsyncStorage.getItem(HIDE_HEADER_COMPONENT_KEY)
      if (isMounted) {
        const hidden = JSON.parse(headerAsyncData)
        if (!hidden) {
          setHeaderHidden(false)
        } else {
          setHeaderHidden(hidden)
        }
      }
    }
    showDisclaimerAlert()

    return () => {
      isMounted = false
    }
  }, [])

  const renderItem = ({ item, section }) => {
    const onPressed = () => {
      navigation.navigate("list-detail", {
        item,
        itemType: "aircraft",
        title: item,
      })
    }
    return (
      <ListItem bottomDivider onPress={onPressed}>
        <ListItem.Content>
          <ListItem.Title>{item}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron type="font-awesome" name="chevron-right" />
      </ListItem>
    )
  }

  const hideHeaderComponent = () => {
    AsyncStorage.setItem(HIDE_HEADER_COMPONENT_KEY, JSON.stringify(true)).then(() => {
      setHeaderHidden(true)
    })
  }
  const renderHeaderComponent = () => {
    return (
      <Card containerStyle={{ marginBottom: 15 }}>
        <Card.Title>DATA WARNING:</Card.Title>
        <Card.Divider />
        <View style={{ marginBottom: 15 }}>
          <Text style={[]}>
            We've tried to clean up the data as much as possible, but USPA member dropzones are
            allowed to enter their own data, resulting in a lot of inconsistent names and spelling
            mistakes.
          </Text>
        </View>
        <Button title="OK" type="outline" onPress={hideHeaderComponent} />
      </Card>
    )
  }

  const renderSectionHeader = ({ section: { title } }) => (
    <ListItem
      bottomDivider
      containerStyle={{
        backgroundColor: color.palette.offWhite,
        paddingVertical: 10,
        paddingHorizontal: 15,
      }}
    >
      <ListItem.Content style={{}}>
        <ListItem.Title style={{ fontWeight: "bold" }}>{title}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  )

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        style={themed(FULL)}
        sections={uniqueAircraftSorted}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={
          !headerHidden || headerHidden === null || __DEV__ ? renderHeaderComponent : null
        }
        removeClippedSubviews
      />
    </View>
  )
})
