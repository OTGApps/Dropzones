import { FC, useState, useRef, useEffect, useMemo, useCallback, memo } from "react"
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
  Platform,
  Dimensions,
  LayoutChangeEvent,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import * as Location from "expo-location"
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from "react-native-maps"
import { List } from "react-native-paper"
import { FontAwesome as Icon } from "@expo/vector-icons"
import { useClusterer, isClusterFeature, type Supercluster } from "react-native-clusterer"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

import { useDropzones, type Dropzone } from "../database"

// Initial map region centered on the USA
const INITIAL_REGION: Region = {
  latitude: 39.828,
  longitude: -98.579,
  latitudeDelta: 50,
  longitudeDelta: 50,
}

type DropzoneFeature = Supercluster.PointFeature<Dropzone>
type ClusterFeature = Supercluster.ClusterFeature<any>

interface ClusterMarkerProps {
  cluster: ClusterFeature
  onPress: (cluster: ClusterFeature) => void
  themed: ReturnType<typeof useAppTheme>["themed"]
}

const ClusterMarker = memo(function ClusterMarker({
  cluster,
  onPress,
  themed,
}: ClusterMarkerProps) {
  const { point_count, point_count_abbreviated } = cluster.properties
  const countDisplay = point_count_abbreviated ?? point_count

  const handlePress = useCallback(() => {
    onPress(cluster)
  }, [cluster, onPress])

  return (
    <Marker
      coordinate={{
        latitude: cluster.geometry.coordinates[1],
        longitude: cluster.geometry.coordinates[0],
      }}
      tracksViewChanges={false}
      onPress={handlePress}
    >
      <View style={themed($clusterBadge)}>
        <Text style={themed($clusterText)}>{countDisplay}</Text>
      </View>
    </Marker>
  )
})

interface DropzoneMarkerProps {
  dropzone: Dropzone
  coordinate: {
    latitude: number
    longitude: number
  }
  onCalloutPress: (anchor: number, name: string) => void
  themed: ReturnType<typeof useAppTheme>["themed"]
  colors: ReturnType<typeof useAppTheme>["theme"]["colors"]
}

const DropzoneMarker = memo(function DropzoneMarker({
  dropzone,
  coordinate,
  onCalloutPress,
  themed,
  colors,
}: DropzoneMarkerProps) {
  const handleCalloutPress = useCallback(() => {
    onCalloutPress(dropzone.anchor, dropzone.name)
  }, [dropzone.anchor, dropzone.name, onCalloutPress])

  return (
    <Marker
      coordinate={coordinate}
      title={dropzone.name}
      description={dropzone.stateCode}
      tracksViewChanges={false}
    >
      <Callout onPress={handleCalloutPress} style={{ backgroundColor: colors.background }}>
        {Platform.OS === "ios" ? (
          <List.Item
            style={themed($calloutItem)}
            titleStyle={themed($calloutTitle)}
            descriptionStyle={themed($calloutDescription)}
            title={dropzone.name}
            description={dropzone.stateCode}
            onPress={handleCalloutPress}
            right={(props) => (
              <Icon {...props} name="chevron-right" size={16} style={themed($chevronRight)} />
            )}
          />
        ) : null}
      </Callout>
    </Marker>
  )
})

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
  const [region, setRegion] = useState<Region>(INITIAL_REGION)
  const [mapDimensions, setMapDimensions] = useState(() => ({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }))
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    let ignore = false
    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {
        if (!ignore && status === "granted") setShowsUserLocation(true)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  const goToDetail = useCallback(
    (anchor: number, title: string) => {
      navigation.navigate(
        "dropzone-detail" as never,
        {
          anchor: anchor.toString(),
          title,
        } as never,
      )
    },
    [navigation],
  )

  const onUserLocationChange = (e: any) => {
    if (!initialZoomDone && showsUserLocation) {
      const { coordinate } = e.nativeEvent
      if (!coordinate) return

      const newRegion: Region = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }

      mapRef.current?.animateToRegion(newRegion, 500)
      setInitialZoomDone(true)
    }
  }

  const dropzoneFeatures = useMemo<DropzoneFeature[]>(() => {
    if (!dropzones) return []
    return dropzones
      .filter((dz) => dz.coordinates?.latitude != null && dz.coordinates?.longitude != null)
      .map((dropzone) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [dropzone.coordinates.longitude, dropzone.coordinates.latitude],
        },
        properties: dropzone,
      }))
  }, [dropzones])

  const [points] = useClusterer(dropzoneFeatures, mapDimensions, region, {
    radius: 10,
    maxZoom: 16,
  })

  const handleClusterPress = useCallback((cluster: ClusterFeature) => {
    const expansionRegion =
      cluster.properties?.getExpansionRegion?.() || (cluster as any).getExpansionRegion?.()
    if (expansionRegion && mapRef.current) {
      mapRef.current.animateToRegion(expansionRegion, 500)
    }
  }, [])

  const onMapLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (width > 0 && height > 0) {
      setMapDimensions({ width, height })
    }
  }, [])

  const onRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion)
  }, [])

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      initialRegion={INITIAL_REGION}
      onRegionChangeComplete={onRegionChangeComplete}
      onLayout={onMapLayout}
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
      {points.map((point) => {
        if (isClusterFeature(point)) {
          return (
            <ClusterMarker
              key={`cluster-${point.properties.cluster_id}`}
              cluster={point}
              onPress={handleClusterPress}
              themed={themed}
            />
          )
        }

        const dropzone = point.properties as Dropzone
        return (
          <DropzoneMarker
            key={`dropzone-${dropzone.anchor}`}
            dropzone={dropzone}
            coordinate={{
              latitude: point.geometry.coordinates[1],
              longitude: point.geometry.coordinates[0],
            }}
            onCalloutPress={goToDetail}
            themed={themed}
            colors={colors}
          />
        )
      })}
    </MapView>
  )
}

const $map: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $clusterBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: colors.palette.primary500,
  borderWidth: 2.5,
  borderColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
})

const $clusterText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  fontWeight: "bold",
  textAlign: "center",
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
