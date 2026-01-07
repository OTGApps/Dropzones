import { FunctionComponent as Component, useState, useRef, useEffect, useMemo } from "react"
import { ViewStyle, Platform } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import { List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from "react-native-maps"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { useStores } from "../models/root-store/root-store-context"

const ROOT: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const NO_PADDING_IOS: ViewStyle = {
  padding: 0,
}

// Initial map region centered on the USA
const INITIAL_REGION: Region = {
  latitude: 39.828,
  longitude: -98.579,
  latitudeDelta: 50,
  longitudeDelta: 50,
}

export const MapScreen: Component = observer(function MapScreen() {
  const {
    theme: { colors },
  } = useAppTheme()

  const navigation = useNavigation()
  const { dropzones } = useStores()
  const [showsUserLocation, setShowsUserLocation] = useState(false)
  const [initialZoomDone, setInitialZoomDone] = useState(false)
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name="location-arrow"
          size={24}
          color={showsUserLocation ? colors.palette.neutral100 : colors.palette.transparentWhite}
          onPress={() => setShowsUserLocation(!showsUserLocation)}
          style={{ marginRight: 15 }}
        />
      ),
    })

    if (showsUserLocation === false) {
      setInitialZoomDone(false)
    }
  }, [navigation, showsUserLocation, colors])

  const goToDetail = (anchor: string, title: string) => {
    navigation.navigate("dropzone-detail", {
      anchor,
      title,
    })
  }

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
          description={dropzone.state}
          tracksViewChanges={false}
        >
          <Callout onPress={() => goToDetail(dropzone.anchor, dropzone.name)}>
            <List.Item
              style={Platform.OS === "ios" ? NO_PADDING_IOS : {}}
              title={dropzone.name}
              description={dropzone.state}
              onPress={() => goToDetail(dropzone.anchor, dropzone.name)}
              right={(props) => (
                <Icon
                  name="chevron-right"
                  size={16}
                  color="#666"
                  style={{ alignSelf: "center" }}
                />
              )}
            />
          </Callout>
        </Marker>
      )) || [],
    [dropzones],
  )

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      initialRegion={INITIAL_REGION}
      style={ROOT({ colors })}
      showsUserLocation={showsUserLocation}
      followsUserLocation={false}
      onUserLocationChange={onUserLocationChange}
      showsMyLocationButton={false}
      showsCompass={true}
      showsScale={Platform.OS === "android"}
      rotateEnabled={true}
      pitchEnabled={true}
    >
      {markers}
    </MapView>
  )
})
