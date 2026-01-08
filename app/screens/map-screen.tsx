import { FC, useState, useRef, useEffect, useMemo, useCallback } from "react"
import { ViewStyle, TextStyle, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from "react-native-maps"
import { List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { useDropzones } from "../database"

// Initial map region centered on the USA
const INITIAL_REGION: Region = {
  latitude: 39.828,
  longitude: -98.579,
  latitudeDelta: 50,
  longitudeDelta: 50,
}

export const MapScreen: FC = function MapScreen() {
  const {
    themed,
    theme: { colors, themeContext },
  } = useAppTheme()

  const navigation = useNavigation()
  const { dropzones } = useDropzones()
  const [showsUserLocation, setShowsUserLocation] = useState(false)
  const [initialZoomDone, setInitialZoomDone] = useState(false)
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    // navigation.setOptions({
    //   headerRight: () => (
    //     <Icon
    //       name="location-arrow"
    //       size={24}
    //       color={showsUserLocation ? colors.palette.neutral100 : colors.palette.transparentWhite}
    //       onPress={() => setShowsUserLocation(!showsUserLocation)}
    //       style={{ marginRight: 15 }}
    //     />
    //   ),
    // })

    if (showsUserLocation === false) {
      setInitialZoomDone(false)
    }
  }, [navigation, showsUserLocation, colors])

  const goToDetail = useCallback(
    (anchor: string, title: string) => {
      navigation.navigate("dropzone-detail", {
        anchor,
        title,
      })
    },
    [navigation],
  )

  const onUserLocationChange = (e: any) => {
    if (!initialZoomDone && showsUserLocation) {
      const { coordinate } = e.nativeEvent
      if (!coordinate) return

      const region: Region = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }

      mapRef.current?.animateToRegion(region, 500)
      setInitialZoomDone(true)
    }
  }

  const markers = useMemo(
    () =>
      dropzones?.map((dropzone) => (
        <Marker
          key={dropzone.anchor}
          coordinate={{
            latitude: dropzone.coordinates.latitude,
            longitude: dropzone.coordinates.longitude,
          }}
          title={dropzone.name}
          description={dropzone.stateCode}
          tracksViewChanges={false}
        >
          <Callout
            onPress={() => goToDetail(dropzone.anchor, dropzone.name)}
            style={{ backgroundColor: colors.background }}
          >
            {Platform.OS === "ios" ? (
              <List.Item
                style={themed($calloutItem)}
                titleStyle={themed($calloutTitle)}
                descriptionStyle={themed($calloutDescription)}
                title={dropzone.name}
                description={dropzone.stateCode}
                onPress={() => goToDetail(dropzone.anchor, dropzone.name)}
                right={(props) => (
                  <Icon {...props} name="chevron-right" size={16} style={themed($chevronRight)} />
                )}
              />
            ) : null}
          </Callout>
        </Marker>
      )) || [],
    [colors.background, dropzones, goToDetail, themed],
  )

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      initialRegion={INITIAL_REGION}
      style={themed($map)}
      showsUserLocation={showsUserLocation}
      followsUserLocation={false}
      onUserLocationChange={onUserLocationChange}
      showsMyLocationButton={false}
      showsCompass={true}
      showsScale={Platform.OS === "android"}
      rotateEnabled={true}
      pitchEnabled={true}
      userInterfaceStyle={themeContext === "dark" ? "dark" : "light"}
    >
      {markers}
    </MapView>
  )
}

const $map: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $calloutItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: Platform.OS === "ios" ? 0 : spacing.sm,
})

const $calloutTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $calloutDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
