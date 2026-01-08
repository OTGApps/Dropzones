import { FC, useEffect, useRef, useMemo, useState, useCallback } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  Dimensions,
  Platform,
  Alert,
  Linking,
  Animated,
  TouchableOpacity,
} from "react-native"
import BottomSheet, { BottomSheetScrollView, useBottomSheetInternal } from "@gorhom/bottom-sheet"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Mailer from "react-native-mail"
import MapView, { Marker } from "react-native-maps"
import openMap from "react-native-open-maps"
import { List, Button, Text } from "react-native-paper"
import { useAnimatedReaction, interpolate, Extrapolate, runOnJS } from "react-native-reanimated"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { useDropzone } from "../database"
import { delay } from "../utils/delay"

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

// Component to track bottom sheet position and update map zoom
const BottomSheetZoomTracker: FC<{ onZoomChange: (zoom: number) => void }> = ({ onZoomChange }) => {
  const { animatedIndex } = useBottomSheetInternal()

  useAnimatedReaction(
    () => animatedIndex.value,
    (index, previousIndex) => {
      // Interpolate zoom: at index 0 (5% handle-only) -> zoom 2.5, at index 1 (75%) -> zoom 1
      const zoom = interpolate(index, [0, 1], [2.5, 1], Extrapolate.CLAMP)
      runOnJS(onZoomChange)(zoom)
    },
    [animatedIndex],
  )

  return null
}

export const DropzoneDetailScreen: Component = function DropzoneDetailScreen(props) {
  const navigation = useNavigation()
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { route } = props as DropzoneDetailScreenProps
  const anchor = parseInt(route.params.anchor)

  const { dropzone: selectedDZ, isLoading } = useDropzone(anchor)

  const bottomSheetRef = useRef<BottomSheet>(null)
  const mapRef = useRef<MapView>(null)
  const snapPoints = useMemo(() => ["5%", "75%"], [])

  // State to track the current zoom level based on bottom sheet position
  const [zoomMultiplier, setZoomMultiplier] = useState(1)
  // State to track the current sheet position for conditional map interactions
  const [sheetIndex, setSheetIndex] = useState(1) // Start at 75%
  // State to track manual zoom level when map is interactive
  const [manualZoom, setManualZoom] = useState(1)
  // Animated value for zoom controls fade in/out
  const zoomControlsOpacity = useRef(new Animated.Value(0)).current

  // Callback to update zoom when bottom sheet moves
  const handleZoomChange = useCallback((zoom: number) => {
    setZoomMultiplier(zoom)
  }, [])

  // Handle bottom sheet position changes
  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index)
    // Interpolate zoom based on snap point index: 0 (5% handle-only) -> 2.5x, 1 (75%) -> 1x
    const zoom = index === 0 ? 2.5 : 1
    setZoomMultiplier(zoom)
    // Reset manual zoom when sheet changes
    if (index === 1) {
      setManualZoom(1)
    }
  }, [])

  // Zoom in button handler
  const handleZoomIn = useCallback(() => {
    setManualZoom((prev) => Math.min(prev * 1.5, 10)) // Max 10x zoom
  }, [])

  // Zoom out button handler
  const handleZoomOut = useCallback(() => {
    setManualZoom((prev) => prev / 1.5)
  }, [])

  // Animate zoom controls fade in/out based on sheet position
  useEffect(() => {
    Animated.timing(zoomControlsOpacity, {
      toValue: sheetIndex === 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [sheetIndex, zoomControlsOpacity])

  // Update map region when zoom changes
  useEffect(() => {
    if (mapRef.current && selectedDZ) {
      const { coordinates } = selectedDZ
      // Apply manual zoom when sheet is collapsed (index 0)
      const effectiveZoom = sheetIndex === 0 ? zoomMultiplier * manualZoom : zoomMultiplier
      const latitudeDelta = Platform.select({ ios: 0.044, android: 0.005 }) / effectiveZoom
      const longitudeDelta = Platform.select({ ios: 0.055, android: 0.015 }) / effectiveZoom
      // Interpolate offset: zoom 2.5 -> 0 offset (centered), zoom 1 -> 0.6 offset (high)
      const offsetMultiplier = ((2.5 - zoomMultiplier) / 1.5) * 0.6
      const latitudeOffset = latitudeDelta * offsetMultiplier

      mapRef.current.animateToRegion(
        {
          latitude: coordinates.latitude - latitudeOffset,
          longitude: coordinates.longitude,
          latitudeDelta,
          longitudeDelta,
        },
        300,
      )
    }
  }, [zoomMultiplier, manualZoom, sheetIndex, selectedDZ])

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
          size={22}
          color={colors.palette.neutral100}
          onPress={openDrivingDirectons}
          style={{ marginRight: 15 }}
        />
      ),
    })

    const focusListener = navigation.addListener("focus", showDisclaimerAlert)
    // Return the focuslistener so it gets removed and we don't cause a memory leak.
    return focusListener
  }, [navigation])

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

  // Handle loading and missing dropzone - after all hooks
  if (isLoading || !selectedDZ) {
    return null
  }

  const { coordinates } = selectedDZ

  // Offset the map center based on sheet position
  // At 5% (handle-only, zoom 2.5x): marker centered (offset = 0)
  // At 75% (expanded, zoom 1x): marker offset to be visible above sheet (offset = 0.6)
  const latitudeDelta = Platform.select({ ios: 0.044, android: 0.005 }) / zoomMultiplier
  const longitudeDelta = Platform.select({ ios: 0.055, android: 0.015 }) / zoomMultiplier
  // Interpolate offset: zoom 2.5 -> 0 offset (centered), zoom 1 -> 0.6 offset (high)
  const offsetMultiplier = ((2.5 - zoomMultiplier) / 1.5) * 0.6
  const latitudeOffset = latitudeDelta * offsetMultiplier

  const regionToDisplay = {
    latitude: coordinates.latitude - latitudeOffset,
    longitude: coordinates.longitude,
    latitudeDelta,
    longitudeDelta,
  }

  return (
    <GestureHandlerRootView style={themed($container)}>
      <View style={themed($container)}>
        {/* Full-screen map */}
        <MapView
          ref={mapRef}
          style={themed($fullScreenMap)}
          initialRegion={regionToDisplay}
          mapType={"satellite"}
          scrollEnabled={sheetIndex === 0}
          zoomEnabled={sheetIndex === 0}
          rotateEnabled={sheetIndex === 0}
          pitchEnabled={sheetIndex === 0}
        >
          <Marker coordinate={coordinates} />
        </MapView>

        {/* Zoom controls - fade in/out when map is interactive */}
        <Animated.View
          style={[themed($zoomControls), { opacity: zoomControlsOpacity }]}
          pointerEvents={sheetIndex === 0 ? "auto" : "none"}
        >
          <TouchableOpacity onPress={handleZoomIn} style={themed($zoomButton)} activeOpacity={0.7}>
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleZoomOut} style={themed($zoomButton)} activeOpacity={0.7}>
            <Icon name="minus" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={1}
          onChange={handleSheetChange}
          enableDynamicSizing={false}
          backgroundStyle={themed($sheetBackground)}
          handleIndicatorStyle={themed($handleIndicator)}
        >
          <BottomSheetZoomTracker onZoomChange={handleZoomChange} />
          <BottomSheetScrollView contentContainerStyle={themed($scrollViewContent)}>
            <View style={themed($sheetHeader)}>
              <Button
                mode="text"
                labelStyle={themed($sectionTitleText)}
                style={themed($noPadding)}
                onPress={openDrivingDirectons}
              >
                {selectedDZ.name}
              </Button>
              <Button
                mode="text"
                icon="open-in-new"
                labelStyle={themed($sectionSubtitleText)}
                style={themed($noPadding)}
                onPress={openWebsite}
              >
                {selectedDZ.website}
              </Button>
            </View>

            <View style={themed($contentContainer)}>
              {selectedDZ.description.length > 0 && (
                <View style={themed($contentSection)}>
                  <Text style={themed($descriptionText)}>{selectedDZ.description}</Text>
                </View>
              )}
              {selectedDZ.phone && (
                <List.Item
                  title={selectedDZ.phone}
                  onPress={openPhone}
                  left={(props) => (
                    <Icon name="phone" size={20} color={colors.text} style={themed($iconStyle)} />
                  )}
                  right={(props) => (
                    <Icon name="chevron-right" size={16} style={themed($chevronRight)} />
                  )}
                />
              )}
              {selectedDZ.email && (
                <List.Item
                  title={selectedDZ.email.toLowerCase()}
                  onPress={handleEmail}
                  left={(props) => (
                    <Icon
                      name="envelope"
                      size={20}
                      color={colors.text}
                      style={themed($iconStyle)}
                    />
                  )}
                  right={(props) => (
                    <Icon name="chevron-right" size={16} style={themed($chevronRight)} />
                  )}
                />
              )}
              {selectedDZ.location && selectedDZ.location.length > 0 && (
                <List.Item
                  title={selectedDZ.location.join("\n")}
                  onPress={openDrivingDirectons}
                  left={(props) => (
                    <Icon name="map" size={20} color={colors.text} style={themed($iconStyle)} />
                  )}
                  right={(props) => (
                    <Icon name="chevron-right" size={16} style={themed($chevronRight)} />
                  )}
                />
              )}
              {selectedDZ.airport && (
                <List.Item
                  title={selectedDZ.airport}
                  left={(props) => (
                    <Icon name="plane" size={20} color={colors.text} style={themed($iconStyle)} />
                  )}
                />
              )}
              {(selectedDZ.country || selectedDZ.state) && (
                <List.Item
                  title={[selectedDZ.state, selectedDZ.country].filter(Boolean).join(", ")}
                  left={(props) => (
                    <Icon name="globe" size={20} color={colors.text} style={themed($iconStyle)} />
                  )}
                />
              )}
              {selectedDZ.aircraft && selectedDZ.aircraft.length > 0 && (
                <List.Item
                  title={selectedDZ.aircraft.slice().sort().join("\n")}
                  left={(props) => (
                    <Icon
                      name="fighter-jet"
                      size={20}
                      color={colors.text}
                      style={themed($iconStyle)}
                    />
                  )}
                />
              )}
              {selectedDZ.services && selectedDZ.services.length > 0 && (
                <List.Item
                  title={selectedDZ.services.slice().sort().join("\n")}
                  left={(props) => (
                    <Icon name="bath" size={20} color={colors.text} style={themed($iconStyle)} />
                  )}
                />
              )}
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $fullScreenMap: ViewStyle = {
  flex: 1,
  width: "100%",
  height: "100%",
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
})

const $contentSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  paddingHorizontal: spacing.md,
})

const $descriptionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  lineHeight: 26,
  color: colors.text,
})

const $iconStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  alignSelf: "flex-start",
  marginRight: spacing.sm,
})

const $noPadding: ViewStyle = {
  padding: 0,
}

const $sheetBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
})

const $handleIndicator: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral400,
})

const $scrollViewContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.lg,
})

const $sheetHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "flex-end",
  paddingHorizontal: spacing.sm,
  marginBottom: 0,
})

const $sectionSubtitleText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.palette.neutral900,
  fontSize: 16,
  paddingVertical: 0,
  fontWeight: "normal",
  textAlign: "right",
})

const $sectionTitleText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.palette.neutral900,
  fontSize: 22,
  paddingVertical: 0,
  fontWeight: "bold",
  textAlign: "right",
})

const $zoomControls: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: spacing.xl,
  left: spacing.md,
  gap: spacing.xs,
})

const $zoomButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 36,
  height: 36,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: colors.palette.neutral900,
  backgroundColor: `rgba(0, 0, 0, 0.7)`,
  justifyContent: "center",
  alignItems: "center",
})
