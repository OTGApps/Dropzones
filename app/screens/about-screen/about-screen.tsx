import React, { FunctionComponent as Component } from "react"
import { Linking, ScrollView } from "react-native"
import Constants from "expo-constants"
import { SocialIcon, Card, ListItem } from "react-native-elements"

const openWeb = (website: string) => {
  Linking.canOpenURL(website).then((supported) => {
    if (supported) {
      Linking.openURL(website)
    }
  })
}
const openInstagram = () => openWeb("https://www.instagram.com/euphoria.art.studios/")
const openGithub = () => openWeb("https://github.com/OTGApps/Dropzones")

export const AboutScreen: Component = () => {
  return (
    <ScrollView style={{ flex: 1 }}>
      <Card>
        <Card.Image source={require("./logo.png")} resizeMode="contain" />
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>Dropzones!</ListItem.Title>
            <ListItem.Subtitle>USPA Dropzone Finder</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title>Version</ListItem.Title>
            <ListItem.Subtitle>
              {Constants.nativeAppVersion}({Constants.nativeBuildVersion})
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
        <ListItem containerStyle={{ paddingBottom: 0 }}>
          <ListItem.Content>
            <ListItem.Title>Data file date:</ListItem.Title>
            <ListItem.Subtitle>9/4/2021</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </Card>
      <ListItem bottomDivider onPress={openGithub}>
        <SocialIcon type="github-alt" raised={false} style={{ margin: 0, padding: 0 }} />
        <ListItem.Content>
          <ListItem.Title>Dropzones is open source!</ListItem.Title>
          <ListItem.Subtitle>Go to Github to find out more or file a bug report</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
      <ListItem bottomDivider onPress={openInstagram}>
        <SocialIcon type="instagram" raised={false} />
        <ListItem.Content>
          <ListItem.Title>Icon design by euphoria.art.studios</ListItem.Title>
          <ListItem.Subtitle>Check her out on Instagram!</ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    </ScrollView>
  )
}
