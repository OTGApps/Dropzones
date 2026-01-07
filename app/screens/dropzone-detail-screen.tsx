import { FunctionComponent as Component, useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, Dimensions, Platform, Alert, Linking } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { Card, ListItem, Button, Icon } from "react-native-elements"
import Mailer from "react-native-mail"
import MapView, { Marker } from "react-native-maps"
import openMap from "react-native-open-maps"
import ParallaxScrollView from "react-native-parallax-scroll-view"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { useStores } from "../models/root-store/root-store-context"
import { delay } from "../utils/delay"

const window = Dimensions.get("window")
const PARALLAX_HEADER_HEIGHT = 300
const STICKY_HEADER_HEIGHT = 50
const OFFSET_TRAVEL = -100
const BACKGROUND_OPACITY = 0.4

const DISCLAIMER_BYPASS_KEY = "@bypassDisclaimer"
const showDisclaimerAlert = async () => {
  const bypassDisclaimer = await AsyncStorage.getItem(DISCLAIMER_BYPASS_KEY)
  if (!JSON.parse(bypassDisclaimer)) {
    await delay(500)
    Alert.alert(
      "Disclaimer:",
      "While every reasonable effort it made to ensure that the dropzone data displayed in this app is accurate, we can not be held liable for incorrect information reported by the USPA.\n\nPlease verify all information with the dropzone directly.\n\nIf you are a DZO please update your information directly with the USPA.",
      [
        {
          text: "Got it!",
          style: "cancel",
        },
        {
          text: "Don't show this again!",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.setItem(DISCLAIMER_BYPASS_KEY, JSON.stringify(true))
          },
        },
      ],
    )
  }
}

export interface DropzoneDetailScreenProps {
  route: any
}

export const DropzoneDetailScreen: Component = observer(function DropzoneDetailScreen(props) {
  const navigation = useNavigation()
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { route } = props as DropzoneDetailScreenProps
  const anchor = parseInt(route.params.anchor)

  const rootStore = useStores()
  const selectedDZ = rootStore.dropzoneById(anchor)

  // TODO - what if the DZ isn't in the database. How did the user get here?
  // maybe from a tyop'd app url?

  const [offset, setOffset] = useState(0)

  const openDrivingDirectons = () => {
    openMap({
      ...selectedDZ.coordinates,
      query: selectedDZ.name,
      end: selectedDZ.name,
      navigate_mode: "preview",
    })
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name={"car"}
          type={"font-awesome"}
          size={22}
          color={colors.palette.neutral100}
          onPress={openDrivingDirectons}
        />
      ),
    })

    const focusListener = navigation.addListener("focus", showDisclaimerAlert)
    // Return the focuslistener so it gets removed and we don't cause a memory leak.
    return focusListener
  }, [navigation])

  // Calculate the background opacity based on their scroll position.
  let backgroundOpacity = BACKGROUND_OPACITY
  switch (true) {
    case offset <= OFFSET_TRAVEL:
      backgroundOpacity = 0.0
      break
    case offset < 0:
      backgroundOpacity =
        BACKGROUND_OPACITY - (Math.abs(offset) / Math.abs(OFFSET_TRAVEL)) * BACKGROUND_OPACITY
      break
  }

  const renderBackground = () => {
    const { coordinates } = selectedDZ
    const regionToDisplay = {
      ...coordinates,
      latitudeDelta: Platform.select({ ios: 0.044, android: 0.005 }),
      longitudeDelta: Platform.select({ ios: 0.055, android: 0.015 }),
    }
    return (
      <View key={"background"}>
        <MapView
          key={"map-view"}
          style={themed($map)}
          initialRegion={regionToDisplay}
          region={regionToDisplay} // Initial region doesn't work alone on android.
          mapType={"satellite"}
          // liteMode
        >
          <Marker coordinate={coordinates} />
        </MapView>
        <View style={[themed($background), { opacity: backgroundOpacity }]} />
      </View>
    )
  }

  const openWebsite = async () => {
    const { website } = selectedDZ
    const supported = await Linking.canOpenURL(website)
    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(website)
    } else {
      Alert.alert(`Don't know how to open this URL: ${website}`)
    }
  }

  const openPhone = async () => {
    const { phone } = selectedDZ

    const callSkyGods = `tel:${phone}`
    const supported = await Linking.canOpenURL(callSkyGods)
    if (callSkyGods && supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(callSkyGods)
    } else {
      Alert.alert(`Don't know how to open this URL: ${callSkyGods}`)
    }
  }

  // const isFlagged = _.includes(flags, anchor)
  // const toggleFlag = () => {
  //   if (__DEV__) console.tron.log("toggle flag. isFlagged", isFlagged)
  //   isFlagged ? rootStore.removeFlag(anchor) : rootStore.addFlag(anchor)
  // }

  const renderForeground = () => (
    <View key="parallax-header" style={themed($parallaxHeader)}>
      <Button
        title={selectedDZ.name}
        type={"clear"}
        titleStyle={themed($sectionTitleText)}
        buttonStyle={themed($noPadding)}
        onPress={openDrivingDirectons}
      />
      <Button
        title={selectedDZ.website}
        titleProps={{
          numberOfLines: 1,
          adjustsFontSizeToFit: true,
        }}
        type={"clear"}
        titleStyle={themed($sectionSubtitleText)}
        buttonStyle={themed($noPadding)}
        onPress={openWebsite}
      />
      {/* <View>
        <Avatar
          containerStyle={styles.iconContainer}
          icon={{
            type: "font-awesome",
            size: 35,
            color: colors.palette.neutral100,
            name: isFlagged ? "flag" : "flag-o",
          }}
          onPress={toggleFlag}
        />
      </View> */}
    </View>
  )

  const onScroll = (e) => {
    setOffset(e.nativeEvent.contentOffset.y)
  }

  const iconProps = {
    type: "font-awesome",
    containerStyle: {
      alignSelf: "flex-start",
    } as ViewStyle,
  }

  const handleEmail = () => {
    Mailer.mail(
      {
        subject: "Question for " + selectedDZ.name,
        recipients: [selectedDZ.email],
        // body: '<b>A Bold Body</b>',
        // isHTML: true,
      },
      (error, event) => {
        if (error) {
          // Probably should log this? maybe? probably not.
          Alert.alert("There was an error", error)
        }
      },
    )
  }

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <ParallaxScrollView
      onScroll={onScroll}
      backgroundColor={colors.tint}
      stickyHeaderHeight={STICKY_HEADER_HEIGHT}
      parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
      backgroundScrollSpeed={30}
      fadeOutForeground
      renderBackground={renderBackground}
      renderForeground={renderForeground}
      overScrollMode={"always"}
    >
      <Card containerStyle={themed($cardStyle)}>
        {selectedDZ.email && (
          <Button title={selectedDZ.email.toLowerCase()} type="outline" onPress={handleEmail} />
        )}
        {selectedDZ.description.length > 0 && (
          <ListItem>
            <ListItem.Content>
              <ListItem.Title style={themed($descriptionText)}>
                {selectedDZ.description}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
        {selectedDZ.phone && (
          <ListItem onPress={openPhone}>
            <Icon name="phone" {...iconProps} />
            <ListItem.Content>
              <ListItem.Title>{selectedDZ.phone}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron type="font-awesome" name="chevron-right" />
          </ListItem>
        )}
        {selectedDZ.location && selectedDZ.location.length > 0 && (
          <ListItem onPress={openDrivingDirectons}>
            <Icon name="map" {...iconProps} />
            <ListItem.Content>
              <ListItem.Title>{selectedDZ.location.join("\n")}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron type="font-awesome" name="chevron-right" />
          </ListItem>
        )}
        {selectedDZ.aircraft && selectedDZ.aircraft.length > 0 && (
          <ListItem>
            <Icon name="plane" {...iconProps} />
            <ListItem.Content>
              <ListItem.Title>{selectedDZ.aircraft.slice().sort().join("\n")}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
        {selectedDZ.services && selectedDZ.services.length > 0 && (
          <ListItem>
            <Icon name="bath" {...iconProps} />
            <ListItem.Content>
              <ListItem.Title>{selectedDZ.services.slice().sort().join("\n")}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
      </Card>
    </ParallaxScrollView>
  )
})

// Styles
const $textShadow: ThemedStyle<TextStyle> = ({ colors }) => ({
  textShadowColor: colors.palette.neutral900,
  textShadowOffset: { width: -2, height: 2 },
  textShadowRadius: 10,
  padding: 10,
  overflow: "visible",
})

const $background: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: window.width,
  backgroundColor: Platform.OS === "ios" ? colors.palette.neutral900 : colors.transparent,
  height: PARALLAX_HEADER_HEIGHT,
})

const $cardStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 0,
  paddingVertical: spacing.sm,
  marginBottom: spacing.md,
  marginTop: -spacing.xxl,
  minHeight: window.height - PARALLAX_HEADER_HEIGHT,
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 2,
    height: 2,
  },
  shadowOpacity: 0.7,
  shadowRadius: 10,
  elevation: 10,
})

const $descriptionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  lineHeight: 26,
  color: colors.text,
})

const $map: ViewStyle = {
  width: "100%",
  height: PARALLAX_HEADER_HEIGHT,
}

const $noPadding: ViewStyle = {
  padding: 0,
}

const $parallaxHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  flexDirection: "column-reverse",
  alignItems: "flex-end",
  marginBottom: spacing.xxxl,
  marginHorizontal: spacing.xxxs,
})

const $sectionSubtitleText: ThemedStyle<TextStyle> = (theme) => ({
  ...$textShadow(theme),
  color: theme.colors.textDim,
  fontSize: 18,
  paddingVertical: 5,
  fontWeight: "bold",
  textAlign: "right",
})

const $sectionTitleText: ThemedStyle<TextStyle> = (theme) => ({
  ...$textShadow(theme),
  color: theme.colors.textDim,
  fontSize: 24,
  paddingVertical: 5,
  fontWeight: "bold",
  textAlign: "right",
})
