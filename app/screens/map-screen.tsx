import React, { useState, useRef, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle, Dimensions } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { useStores } from "../models/root-store"
import { color, spacing, typography } from "../theme"
import { ListItem, Icon } from 'react-native-elements'
import _ from 'lodash'

import MapView from "react-native-map-clustering"
import { Marker, Callout, LatLng } from "react-native-maps"

export interface MapScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

const ROOT: ViewStyle = {
  flex: 1,
  backgroundColor: color.background,
}

const NO_MARGIN: ViewStyle = {
  padding: 0
}

const window = Dimensions.get('window')
const { width, height } = window
const LATITUDE_DELTA = 50
const LONGITUDE_DELTA = LATITUDE_DELTA + (width / height)
const INITIAL_REGION = {
  latitude: 39.828, // Geographic center
  longitude: -98.579, // of the USA
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
}

export const MapScreen: React.FunctionComponent<MapScreenProps> = observer((props) => {
  const { dropzones } = useStores()
  const [showsUserLocation, setShowsUserLocation] = useState(false)
  const [followsUserLocation, setFollowsUserLocation] = useState(false)
  const mapRef = useRef(null)

  const findUserLocation = () => {
    console.tron.log('finding user location')
    setShowsUserLocation(!showsUserLocation)
  }

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <Icon
          name={'map-pin'}
          type={'font-awesome'}
          size={22}
          color={color.palette.white}
          onPress={() => setShowsUserLocation(!showsUserLocation)}
        />
      ),
    })
  }, [props.navigation, showsUserLocation, setShowsUserLocation])

  const markersArray = dropzones.map((d) => (
    <Marker
      key={d.anchor.toString()}
      coordinate={d.coordinates as LatLng}
    >
      <Callout>
        <ListItem
          chevron
          title={d.name}
          containerStyle={NO_MARGIN}
          onPress={() => props.navigation.navigate('dropzone-detail', {
            item: JSON.stringify(d)
          })}
        />
      </Callout>
    </Marker>))

  return (
    <MapView
      ref={mapRef}
      initialRegion={INITIAL_REGION}
      style={ROOT}
      clusterColor={color.primary}
      clusterFontFamily={typography.primary}
      tracksClusterViewChanges={false}
      spiralEnabled={false}
      extent={350} // Changing the number changes how close the dropzones have to be to be grouped.
      edgePadding={{
        top: spacing[11],
        left: spacing[11],
        bottom: spacing[11],
        right: spacing[11]
      }}
      // @ts-ignore
      userLocationPriority={'passive'} // Android setting
      showsUserLocation={showsUserLocation}
      onMapReady={() => {
        console.log('onmapready', mapRef)
      }}
      // @ts-ignore
      // onRegionChangeComplete={(region, markers) => {

      // }}
      onUserLocationChange={(e) => {
        const { coordinate } = e.nativeEvent
        if (!coordinate) return
        const { mapView } = mapRef.current || {}
        mapView.animateCamera({
          center: _.pick(coordinate, ['longitude', 'latitude']),
          altitude: 10000 * 100,
        }, 4000)
      }}
    >
      {markersArray}
    </MapView>
  )
})
