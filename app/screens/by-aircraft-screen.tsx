import { FC, useState, useEffect, useCallback, useMemo } from "react"
import { ViewStyle, TextStyle, SectionList, View, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Button, Card, List, Badge, Searchbar } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight, $searchbar } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"
import { ListSeparator } from "@/components"

import { useUniqueAircraft } from "../database"
import { load, save } from "../utils/storage"

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
  const [searchQuery, setSearchQuery] = useState("")
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    const hidden = load<boolean>(HIDE_HEADER_COMPONENT_KEY)
    if (!hidden) {
      setHeaderHidden(false)
    } else {
      setHeaderHidden(hidden)
    }
  }, [])

  // Handle search input
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text)
  }, [])

  // Filter aircraft based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return uniqueAircraftSorted
    }

    const query = searchQuery.toLowerCase()
    return uniqueAircraftSorted
      .map((section) => ({
        ...section,
        data: section.data.filter((item) => item.name.toLowerCase().includes(query)),
      }))
      .filter((section) => section.data.length > 0)
  }, [uniqueAircraftSorted, searchQuery])

  const renderItem = useCallback(
    ({ item, section }) => {
      const onPressed = () => {
        navigation.navigate("list-detail", {
          item: item.name,
          itemType: "aircraft",
          title: item.name,
        })
      }
      return (
        <List.Item
          title={item.name}
          onPress={onPressed}
          right={(props) => (
            <View style={themed($rightContainer)}>
              <Badge style={themed($badge)}>{item.count}</Badge>
              <Icon {...props} name="chevron-right" size={16} style={themed($chevronRight)} />
            </View>
          )}
        />
      )
    },
    [navigation, themed],
  )

  const hideHeaderComponent = () => {
    save(HIDE_HEADER_COMPONENT_KEY, true)
    setHeaderHidden(true)
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

  const searchBar = useMemo(
    () => (
      <Searchbar
        placeholder="Search Aircraft..."
        value={searchQuery}
        onChangeText={handleSearch}
        autoComplete="off"
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        accessibilityLabel="Search aircraft"
        accessibilityHint="Filter the list of aircraft by name or manufacturer"
        accessibilityRole="search"
        style={themed($searchbar)}
      />
    ),
    [searchQuery, handleSearch, themed],
  )

  const listHeader = useMemo(() => {
    const warningCard =
      !headerHidden || headerHidden === null ? renderHeaderComponent() : null
    return (
      <>
        {warningCard}
        {searchBar}
      </>
    )
  }, [headerHidden, renderHeaderComponent, searchBar])

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        style={themed(FULL)}
        sections={filteredSections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={listHeader}
        removeClippedSubviews
      />
    </View>
  )
}

const $warningCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  margin: spacing.sm,
})

const $warningText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginBottom: spacing.md,
  color: colors.text,
})

const $rightContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.xs,
})

const $badge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
  alignSelf: "center",
  fontSize: 14,
})
