import React, { FunctionComponent as Component, useState, useRef, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { ViewStyle, Platform, useWindowDimensions } from "react-native"
import { useStores } from "app/models"
import { colors, spacing, typography } from "../theme"
import { ListItem, Icon } from "react-native-elements"
import MapView from "react-native-map-clustering"
import Map, { Marker, Callout, LatLng, Region } from "react-native-maps"
import { getSnapshot } from "mobx-state-tree"
import Device, { DeviceType } from "expo-device"

const ROOT: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const NO_PADDING_IOS: ViewStyle = {
  padding: 0,
}

export const MapScreen: Component = observer(function MapScreen() {
  const navigation = useNavigation()
  const { dropzones } = useStores()
  const [showsUserLocation, setShowsUserLocation] = useState(false)
  const [initialZoomDone, setInitialZoomDone] = useState(false)
  const [clusteringEnabled, setClusteringEnabled] = useState(true)
  const mapRef = useRef<Map>()

  const { width, height } = useWindowDimensions()

  const LATITUDE_DELTA = 50
  const LONGITUDE_DELTA = LATITUDE_DELTA + width / height
  const INITIAL_REGION = {
    latitude: 39.828, // Geographic center
    longitude: -98.579, // of the USA
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name={"location-arrow"}
          type={"font-awesome"}
          size={24}
          color={showsUserLocation ? colors.palette.white : colors.palette.transparentWhite}
          onPress={() => setShowsUserLocation(!showsUserLocation)}
        />
      ),
    })

    if (showsUserLocation === false) {
      setInitialZoomDone(false)
    }
  }, [navigation, showsUserLocation])

  const goToDetail = (anchor: string, title: string) => {
    navigation.navigate("dropzone-detail", {
      anchor,
      title,
    })
  }

  const markersArray = React.useMemo(
    () =>
      getSnapshot(dropzones).map((d) => {
        return (
          <Marker
            key={d.anchor.toString() + "_" + Date.now()}
            coordinate={d.coordinates as LatLng}
            pointerEvents="auto"
          >
            <Callout onPress={() => goToDetail(d.anchor, d.name)}>
              <ListItem
                containerStyle={Platform.OS === "ios" ? NO_PADDING_IOS : {}}
                onPress={() => goToDetail(d.anchor, d.name)}
              >
                <ListItem.Content>
                  <ListItem.Title>{d.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron type="font-awesome" name="chevron-right" />
              </ListItem>
            </Callout>
          </Marker>
        )
      }),
    [dropzones],
  )

  const checkClustering = (region: Region) => {
    const distanceDelta = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2)
    if (distanceDelta > 7) {
      setClusteringEnabled(false)
    } else {
      setClusteringEnabled(true)
    }
  }

  const onUserLocationChange = (e) => {
    if (!initialZoomDone) {
      const { coordinate } = e.nativeEvent
      if (!coordinate) return
      const region = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }

      mapRef.current?.animateToRegion(region, 500)
      setInitialZoomDone(true)
    }
  }

  return (
    <MapView
      ref={mapRef}
      clusteringEnabled={clusteringEnabled}
      initialRegion={INITIAL_REGION}
      onRegionChangeComplete={checkClustering}
      style={ROOT}
      clusterColor={colors.primary}
      clusterFontFamily={typography.primary}
      tracksViewChanges={false}
      spiralEnabled={false}
      animationEnabled
      radius={10}
      edgePadding={{
        top: spacing[11],
        left: spacing[11],
        bottom: spacing[11],
        right: spacing[11],
      }}
      userLocationPriority={"passive"} // Android setting
      showsUserLocation={showsUserLocation}
      followsUserLocation={false}
      onUserLocationChange={onUserLocationChange}
    >
      {markersArray}
    </MapView>
  )
})
