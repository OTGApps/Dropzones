import React, { FunctionComponent as Component, useState, useRef, useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { ViewStyle, Dimensions, Platform } from "react-native"
import { useStores } from "../models/root-store/root-store-context"
import { color, spacing, typography } from "../theme"
import { ListItem, Icon } from "react-native-elements"
import _ from "lodash"

import MapView from "react-native-map-clustering"
import { Marker, Callout, LatLng } from "react-native-maps"

const ROOT: ViewStyle = {
  flex: 1,
  backgroundColor: color.background,
}

const NO_PADDING_IOS: ViewStyle = {
  padding: 0,
}

const window = Dimensions.get("window")
const { width, height } = window
const LATITUDE_DELTA = 50
const LONGITUDE_DELTA = LATITUDE_DELTA + width / height
const INITIAL_REGION = {
  latitude: 39.828, // Geographic center
  longitude: -98.579, // of the USA
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
}

export const MapScreen: Component = observer(function MapScreen() {
  const navigation = useNavigation()
  const { dropzones } = useStores()
  const [showsUserLocation, setShowsUserLocation] = useState(false)
  // const [followsUserLocation, setFollowsUserLocation] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name={"map-pin"}
          type={"font-awesome"}
          size={22}
          color={color.palette.white}
          onPress={() => setShowsUserLocation(!showsUserLocation)}
        />
      ),
    })
  }, [navigation, showsUserLocation, setShowsUserLocation])

  const goToDetail = dropzone => {
    navigation.navigate("dropzone-detail", {
      anchor: dropzone.anchor,
      title: dropzone.name,
    })
  }

  const markersArray = dropzones.map(d => (
    <Marker key={d.anchor.toString()} coordinate={d.coordinates as LatLng}>
      <Callout onPress={() => goToDetail(d)}>
        <ListItem
          containerStyle={Platform.OS === "ios" ? NO_PADDING_IOS : {}}
          onPress={() => goToDetail(d)}
        >
          <ListItem.Content>
            <ListItem.Title>{d.name}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron type="font-awesome" name="chevron-right" />
        </ListItem>
      </Callout>
    </Marker>
  ))

  return (
    <MapView
      ref={mapRef}
      initialRegion={INITIAL_REGION}
      style={ROOT}
      clusterColor={color.primary}
      clusterFontFamily={typography.primary}
      tracksViewChanges={false}
      spiralEnabled={false}
      extent={350} // Changing the number changes how close the dropzones have to be to be grouped.
      edgePadding={{
        top: spacing[11],
        left: spacing[11],
        bottom: spacing[11],
        right: spacing[11],
      }}
      // @ts-ignore
      userLocationPriority={"passive"} // Android setting
      showsUserLocation={showsUserLocation}
      // onMapReady={() => {
      //   if (__DEV__) console.log('onmapready', mapRef)
      // }}
      // @ts-ignore
      // onRegionChangeComplete={(region, markers) => {
      //   if (__DEV__) console.tron.log('region', region, markers);
      // }}
      onUserLocationChange={e => {
        const { coordinate } = e.nativeEvent
        if (!coordinate) return
        const { mapView } = mapRef.current || {}
        mapView.animateCamera(
          {
            center: _.pick(coordinate, ["longitude", "latitude"]),
            altitude: 10000 * 100,
          },
          4000,
        )
      }}
    >
      {markersArray}
    </MapView>
  )
})
