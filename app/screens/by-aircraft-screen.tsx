import { FC, useState, useEffect, useCallback } from "react"
import { ViewStyle, TextStyle, SectionList, View, Text } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { Button, Card, List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { useUniqueAircraft } from "../database"

const FULL: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const keyExtractor = (item, index) => index.toString()
const HIDE_HEADER_COMPONENT_KEY = "@aircraftHasSeenWarning"

export const ByAircraftScreen: FC = function ByAircraftScreen() {
  const navigation = useNavigation()
  const { aircraftSections: uniqueAircraftSorted } = useUniqueAircraft()
  const [headerHidden, setHeaderHidden] = useState<boolean | null>(null)
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

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

  const renderItem = useCallback(
    ({ item, section }) => {
      const onPressed = () => {
        navigation.navigate("list-detail", {
          item,
          itemType: "aircraft",
          title: item,
        })
      }
      return (
        <List.Item
          title={item}
          onPress={onPressed}
          right={(props) => <Icon name="chevron-right" size={16} style={themed($chevronRight)} />}
        />
      )
    },
    [navigation],
  )

  const hideHeaderComponent = () => {
    AsyncStorage.setItem(HIDE_HEADER_COMPONENT_KEY, JSON.stringify(true)).then(() => {
      setHeaderHidden(true)
    })
  }
  const renderHeaderComponent = useCallback(() => {
    return (
      <Card style={themed($warningCard)}>
        <Card.Title title="DATA WARNING:" />
        <Card.Content>
          <Text style={themed($warningText)}>
            We've tried to clean up the data as much as possible, but USPA member dropzones are
            allowed to enter their own data, resulting in a lot of inconsistent names and spelling
            mistakes.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={hideHeaderComponent}>
            OK
          </Button>
        </Card.Actions>
      </Card>
    )
  }, [themed])

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => (
      <List.Subheader
        style={{
          backgroundColor: colors.palette.neutral300,
          fontWeight: "bold",
        }}
      >
        {title}
      </List.Subheader>
    ),
    [colors],
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
}

const $warningCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  margin: spacing.sm,
})

const $warningText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})
