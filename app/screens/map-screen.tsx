import { FC, useState, useRef, useEffect, useMemo, useCallback } from "react"
import { View, ViewStyle, TextStyle, Platform, TouchableOpacity } from "react-native"
import Icon from "@expo/vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native"
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from "react-native-maps"
import { List, Menu } from "react-native-paper"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"
import { MAP_TYPES, MapType, useMapType } from "@/utils/useMapType"

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
    theme: { colors },
    themeContext,
  } = useAppTheme()

  const navigation = useNavigation()
  const { dropzones } = useDropzones()
  const [showsUserLocation, setShowsUserLocation] = useState(false)
  const [initialZoomDone, setInitialZoomDone] = useState(false)
  const { mapType, changeMapType } = useMapType()
  const [mapTypeMenuVisible, setMapTypeMenuVisible] = useState(false)
  const mapRef = useRef<MapView>(null)

  const handleMapTypeChange = useCallback(
    (type: MapType) => {
      changeMapType(type)
      setMapTypeMenuVisible(false)
    },
    [changeMapType],
  )

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
    <View style={themed($container)}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={INITIAL_REGION}
        style={themed($map)}
        mapType={mapType}
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
      <View style={$mapTypeButtonContainer}>
        <Menu
          visible={mapTypeMenuVisible}
          onDismiss={() => setMapTypeMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setMapTypeMenuVisible(true)}
              style={themed($mapTypeButton)}
              activeOpacity={0.8}
              accessibilityLabel="Map type"
            >
              <Icon
                name={(MAP_TYPES.find((t) => t.value === mapType)?.icon ?? "map") as any}
                size={18}
                color={colors.text}
              />
            </TouchableOpacity>
          }
        >
          {MAP_TYPES.map((type) => (
            <Menu.Item
              key={type.value}
              onPress={() => handleMapTypeChange(type.value)}
              title={type.label}
              leadingIcon={
                mapType === type.value
                  ? "check"
                  : ({ size, color }) => <Icon name={type.icon as any} size={size} color={color} />
              }
            />
          ))}
        </Menu>
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $map: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $mapTypeButtonContainer: ViewStyle = {
  position: "absolute",
  top: 12,
  right: 12,
}

const $mapTypeButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderRadius: 8,
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 3,
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
