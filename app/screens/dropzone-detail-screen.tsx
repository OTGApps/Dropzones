import React, { useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, StyleSheet, Dimensions, Platform, Alert, Linking } from "react-native"
import { ParamListBase } from "@react-navigation/native"
import { NativeStackNavigationProp } from "react-native-screens/native-stack"
import { color, spacing } from "../theme"
import { Dropzone } from "../models/root-store"
import ParallaxScrollView from 'react-native-parallax-scroll-view'
import MapView, { Marker } from 'react-native-maps'
import { Card, Text, ListItem, Button, Icon } from 'react-native-elements'
import Mailer from 'react-native-mail'
import { createOpenLink } from 'react-native-open-maps'

export interface DropzoneDetailScreenProps {
  navigation: NativeStackNavigationProp<ParamListBase>
}

const window = Dimensions.get('window')
const PARALLAX_HEADER_HEIGHT = 300
const STICKY_HEADER_HEIGHT = 50
const OFFSET_TRAVEL = -100
const BACKGROUND_OPACITY = 0.4

const textShadow = {
  textShadowColor: color.palette.black,
  textShadowOffset: { width: -2, height: 2 },
  textShadowRadius: 10,
  padding: 10,
  overflow: 'visible',
} as TextStyle

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    backgroundColor: Platform.OS === "ios" ? color.palette.black : color.transparent,
    height: PARALLAX_HEADER_HEIGHT,
  } as ViewStyle,
  cardStyle: {
    borderWidth: 0,
    paddingVertical: spacing[4],
    marginBottom: spacing[8],
    marginTop: -spacing[8],
    minHeight: window.height - PARALLAX_HEADER_HEIGHT,

    // Card Shadow
    shadowColor: color.palette.black,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  } as ViewStyle,
  descriptionText: {
    fontSize: 18,
    lineHeight: 26,
    color: color.text
  } as TextStyle,
  map: {
    width: window.width,
    height: PARALLAX_HEADER_HEIGHT
  } as ViewStyle,
  noPadding: {
    padding: 0
  } as TextStyle,
  parallaxHeader: {
    flex: 1,
    flexDirection: 'column-reverse',
    alignItems: 'flex-end',
    marginBottom: spacing[10],
    marginHorizontal: spacing[1]
  } as ViewStyle,
  sectionSubtitleText: {
    ...textShadow,
    color: color.lightText,
    fontSize: 18,
    paddingVertical: 5,
    fontWeight: 'bold',
    textAlign: 'right',
  } as TextStyle,
  sectionTitleText: {
    ...textShadow,
    color: color.lightText,
    fontSize: 24,
    paddingVertical: 5,
    fontWeight: 'bold',
    textAlign: 'right',
  } as TextStyle,
  stickySection: {
    width: 300,
    justifyContent: 'center',
    padding: spacing[3]
  } as ViewStyle,
  stickySectionText: {
    color: color.lightText,
    fontSize: 20,
    margin: 0,
    padding: 0,
    fontWeight: 'bold',
    letterSpacing: 1.15
  } as TextStyle
})

export const DropzoneDetailScreen: React.FunctionComponent<DropzoneDetailScreenProps> = ({ route, navigation }) => {
  const { item } = route.params
  const i: Dropzone = JSON.parse(item) // un-stringify it from the previous screen.
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name={'car'}
          type={'font-awesome'}
          size={22}
          color={color.palette.white}
          onPress={() => Alert.alert('test') }
        />
      ),
    })
  }, [navigation])

  // Calculate the background opacity based on their scroll position.
  let backgroundOpacity = BACKGROUND_OPACITY
  switch (true) {
    case (offset <= OFFSET_TRAVEL):
      backgroundOpacity = 0.0
      break
    case (offset < 0):
      backgroundOpacity = BACKGROUND_OPACITY - (Math.abs(offset) / Math.abs(OFFSET_TRAVEL) * BACKGROUND_OPACITY)
      break
  }

  const renderBackground = () => {
    return (
      <View key='background'>
        <MapView
          key='map-view'
          style={styles.map}
          initialRegion={{
            ...i.coordinates,
            latitudeDelta: 0.044,
            longitudeDelta: 0.055,
          }}
          mapType={'satellite'}
        >
          <Marker coordinate={i.coordinates} />
        </MapView>
        <View style={[styles.background, { opacity: backgroundOpacity }]}/>
      </View>
    )
  }

  const openWebsite = async () => {
    const supported = await Linking.canOpenURL(i.website)
    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(i.website)
    } else {
      Alert.alert(`Don't know how to open this URL: ${i.website}`)
    }
  }

  const openPhone = async () => {
    const supported = await Linking.canOpenURL(i.phone)
    if (i.phone && supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(i.phone)
    } else {
      Alert.alert(`Don't know how to open this URL: ${i.phone}`)
    }
  }

  const openMap = createOpenLink(i.coordinates)
  const renderForeground = () => (
    <View key='parallax-header' style={styles.parallaxHeader}>
      <Button
        title={i.name}
        type={'clear'}
        titleStyle={styles.sectionTitleText}
        buttonStyle={styles.noPadding}
        onPress={openMap}
      />
      <Button
        title={i.website}
        titleProps={{
          numberOfLines: 1,
          adjustsFontSizeToFit: true
        }}
        type={'clear'}
        titleStyle={styles.sectionSubtitleText}
        buttonStyle={styles.noPadding}
        onPress={openMap}
      />
    </View>
  )

  const renderStickyHeader = () => (
    <View key="sticky-header" style={styles.stickySection}>
      <Text style={styles.stickySectionText}>{i.name}</Text>
    </View>
  )

  const onScroll = (e) => {
    setOffset(e.nativeEvent.contentOffset.y)
  }

  const iconProps = {
    type: 'font-awesome',
    containerStyle: {
      alignSelf: 'flex-start'
    } as ViewStyle
  }

  const handleEmail = () => {
    Mailer.mail({
      subject: 'Question for ' + i.name,
      recipients: [i.email],
      // body: '<b>A Bold Body</b>',
      // isHTML: true,
    }, (error, event) => {
      if (error) {
        // Probably should log this? maybe? probably not.
        Alert.alert(
          'There was an error',
          error
        )
      }
    })
  }
  const emailButton = (
    <Button
      title={i.email}
      type="outline"
      onPress={handleEmail}
    />
  )

  return (
    <ParallaxScrollView
      onScroll={onScroll}
      backgroundColor={color.primary}
      stickyHeaderHeight={STICKY_HEADER_HEIGHT}
      parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
      backgroundScrollSpeed={30}
      fadeOutForeground
      renderBackground={renderBackground}
      renderForeground={renderForeground}
      renderStickyHeader={renderStickyHeader}
      overScrollMode={'always'}
    >
      <Card title={emailButton} containerStyle={styles.cardStyle}>
        {i.description && <ListItem
          title={i.description}
          titleStyle={styles.descriptionText}
        />}
        {i.phone && <ListItem
          leftIcon={{ ...iconProps, name: 'phone' }}
          title={i.phone}
          onPress={openPhone}
        />}
        {i.location.length > 0 && <ListItem
          leftIcon={{ ...iconProps, name: 'map' }}
          title={i.location.join('\n')}
          onPress={openMap}
        />}
        {i.aircraft.length > 0 && <ListItem
          leftIcon={{ ...iconProps, name: 'plane' }}
          title={i.aircraft.sort().join('\n')}
        />}
        {i.services.length > 0 && <ListItem
          leftIcon={{ ...iconProps, name: 'bath' }}
          title={i.services.sort().join('\n')}
        />}
      </Card>
    </ParallaxScrollView>
  )
}
