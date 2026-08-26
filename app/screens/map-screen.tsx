import { FC, useState, useRef, useEffect, useMemo, useCallback } from "react"
import { View, ViewStyle, TextStyle, Platform, LayoutChangeEvent, Dimensions } from "react-native"
import { FontAwesome as Icon } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { isClusterFeature, useClusterer } from "react-native-clusterer"
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from "react-native-maps"
import { List, Text } from "react-native-paper"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { Dropzone, useDropzones } from "../database"

// Cluster radius, in pixels, before nearby dropzones merge into one marker.
// Prevents overlapping pins where tapping one can register on a neighbor.
const CLUSTER_RADIUS = 50

const INITIAL_MAP_DIMENSIONS = Dimensions.get("window")

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
  const [showsUserLocation, _setShowsUserLocation] = useState(false)
  const [initialZoomDone, setInitialZoomDone] = useState(false)
  const [region, setRegion] = useState<Region>(INITIAL_REGION)
  const [mapDimensions, setMapDimensions] = useState<{ width: number; height: number }>(
    INITIAL_MAP_DIMENSIONS,
  )
  const mapRef = useRef<MapView>(null)

  const onMapLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setMapDimensions({ width, height })
  }, [])

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

  const dropzonePoints = useMemo(
    () =>
      dropzones?.map((dropzone) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [dropzone.coordinates.longitude, dropzone.coordinates.latitude],
        },
        properties: { dropzone },
      })) || [],
    [dropzones],
  )

  const [points] = useClusterer<{ dropzone: Dropzone }>(dropzonePoints, mapDimensions, region, {
    radius: CLUSTER_RADIUS,
  })

  const markers = useMemo(
    () =>
      points.map((point) => {
        const [longitude, latitude] = point.geometry.coordinates
        const coordinate = { latitude: latitude!, longitude: longitude! }

        if (isClusterFeature(point)) {
          return (
            <Marker
              key={`cluster-${point.properties.cluster_id}`}
              testID={`map-cluster-${point.properties.cluster_id}`}
              coordinate={coordinate}
              onPress={() =>
                mapRef.current?.animateToRegion(
                  {
                    ...coordinate,
                    latitudeDelta: region.latitudeDelta / 2,
                    longitudeDelta: region.longitudeDelta / 2,
                  },
                  300,
                )
              }
            >
              <View style={themed($clusterMarker)}>
                <Text style={themed($clusterMarkerText)}>{point.properties.point_count}</Text>
              </View>
            </Marker>
          )
        }

        const { dropzone } = point.properties
        return (
          <Marker
            key={dropzone.anchor}
            identifier={dropzone.anchor.toString()}
            testID={`map-marker-${dropzone.anchor}`}
            coordinate={coordinate}
            title={dropzone.name}
            description={dropzone.stateCode}
            tracksViewChanges={false}
          >
            <Callout tooltip onPress={() => goToDetail(dropzone.anchor.toString(), dropzone.name)}>
              <List.Item
                testID={`map-callout-${dropzone.anchor}`}
                style={themed($calloutItem)}
                titleStyle={themed($calloutTitle)}
                descriptionStyle={themed($calloutDescription)}
                title={dropzone.name}
                description={dropzone.stateCode}
                onPress={() => goToDetail(dropzone.anchor.toString(), dropzone.name)}
                right={(props) => (
                  <Icon
                    {...props}
                    name="chevron-right"
                    size={16}
                    style={themed($calloutChevronRight)}
                  />
                )}
              />
            </Callout>
          </Marker>
        )
      }),
    [points, region, goToDetail, themed],
  )

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      initialRegion={INITIAL_REGION}
      onLayout={onMapLayout}
      onRegionChangeComplete={setRegion}
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

const $calloutItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minWidth: 200,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.background,
  borderRadius: spacing.xs,
})

const $calloutChevronRight: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  alignSelf: "center",
  color: colors.textDim,
  marginLeft: spacing.sm,
})

const $calloutTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $calloutDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $clusterMarker: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.tint,
  borderWidth: 2,
  borderColor: colors.background,
})

const $clusterMarkerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "bold",
})
