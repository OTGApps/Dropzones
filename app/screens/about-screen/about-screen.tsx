import React, { FunctionComponent as Component } from "react"
import { ViewStyle, View, Image, Linking, ImageStyle, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { color, spacing } from "../../theme"
import { Text, Icon, SocialIcon } from "react-native-elements"
import DeviceInfo from "react-native-device-info"
import Background from "./background.svg"
import { SafeAreaView } from "react-native-safe-area-context"

const LOGO: ImageStyle = {
  width: 200,
  height: 200,
}

const ROOT: ViewStyle = {
  flex: 1,
}

const WRAPPER = {
  flex: 1,
  flexDirection: "column",
}
const ABOUT: ViewStyle = {
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  alignContent: "space-between",
}
const INSTAGRAM = {
  flexDirection: "column",
  alignItems: "center",
  padding: spacing[3],
}
const openInstagram = async () => {
  const website = "https://www.instagram.com/euphoria.art.studios/"
  const supported = await Linking.canOpenURL(website)
  if (supported) {
    await Linking.openURL(website)
  }
}

export const AboutScreen: Component = () => {
  return (
    <View style={ROOT}>
      <View style={WRAPPER}>
        <View style={ABOUT}>
          <Image source={require("./logo.png")} style={LOGO} />
          <Text h3>Dropzones:</Text>
          <Text h4>USPA Dropzone Finder</Text>
          <Text style={{ marginTop: spacing[1] }}>
            Version: {DeviceInfo.getVersion()}({DeviceInfo.getBuildNumber()})
          </Text>
        </View>

        <View style={INSTAGRAM}>
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
  // return (
  //   <View style={FULL}>
  //     <View style={[INNER]}>
  //       <View style={CENTERED}>
  //       </View>
  //       <View style={CENTERED}>
  //       </View>
  //     </View>
  //   </View>
  // )
}
