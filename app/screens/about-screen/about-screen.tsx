import React, { FunctionComponent as Component } from "react"
import { ViewStyle, View, Image, Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { color, spacing } from "../../theme"
import { Text, Icon, SocialIcon } from "react-native-elements"
import DeviceInfo from "react-native-device-info"
import Background from "./background.svg"

const FULL: ViewStyle = {
  flex: 1,
  flexDirection: "column",
  backgroundColor: color.background,
  alignItems: "flex-start",
}

const LOGO: ViewStyle = {
  width: 200,
  height: 200,
}

const BACKGROUND: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

const ICON: ViewStyle = {
  padding: spacing[3],
}

const OUTER: ViewStyle = {
  alignSelf: "center",
  flex: 1,
  justifyContent: "flex-start",
  marginTop: spacing[11],
  shadowColor: "#000000",
  shadowOffset: {
    width: 5,
    height: 7,
  },
  shadowOpacity: 0.5,
  shadowRadius: 10,
  elevation: 15,
}

const INNER: ViewStyle = {
  padding: spacing[6],
  paddingBottom: spacing[5],
  alignItems: "center",
  backgroundColor: "#FFFFFF",
  borderRadius: 10,
}

const openInstagram = async () => {
  const website = "https://www.instagram.com/euphoria.art.studios/"
  const supported = await Linking.canOpenURL(website)
  if (supported) {
    await Linking.openURL(website)
  }
}

export const AboutScreen: Component = () => {
  const navigation = useNavigation()

  return (
    <View style={FULL}>
      <Background style={BACKGROUND} />
      <View style={[BACKGROUND, { backgroundColor: "#FFFFFF33" }]} />
      <Icon
        name={"close"}
        type={"font-awesome"}
        size={22}
        color={color.text}
        onPress={() => navigation.goBack()}
        style={ICON}
      />
      <View style={OUTER}>
        <View style={INNER}>
          <Image source={require("./logo.png")} style={LOGO} />
          <Text h3>Dropzones:</Text>
          <Text h4>USPA Dropzone Finder</Text>
          <Text style={{ marginTop: spacing[1] }}>
            Version: {DeviceInfo.getVersion()}({DeviceInfo.getBuildNumber()})
          </Text>
          <SocialIcon
            type="instagram"
            style={{ marginTop: spacing[5], marginBottom: spacing[3] }}
            onPress={openInstagram}
          />
          <Text>Icon design by euphoria.art.studios</Text>
        </View>
      </View>
    </View>
  )
}
