import { FunctionComponent as Component } from "react"
import { Linking, ScrollView, View } from "react-native"
import * as Application from "expo-application"
import { Card, List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

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
      <Card style={{ margin: 10 }}>
        <Card.Cover source={require("./logo.png")} resizeMode="contain" style={{ backgroundColor: "white" }} />
        <List.Item title="Dropzones!" description="USPA Dropzone Finder" />
        <List.Item
          title="Version"
          description={`${Application.nativeApplicationVersion}(${Application.nativeBuildVersion})`}
        />
        <List.Item title="Data file date:" description="9/4/2021" />
      </Card>
      <List.Item
        title="Dropzones is open source!"
        description="Go to Github to find out more or file a bug report"
        onPress={openGithub}
        left={(props) => (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#333",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              alignSelf: "center",
            }}
          >
            <Icon name="github" size={24} color="white" />
          </View>
        )}
        right={(props) => <Icon name="chevron-right" size={16} color="#666" style={{ alignSelf: "center" }} />}
      />
      <List.Item
        title="Icon design by euphoria.art.studios"
        description="Check her out on Instagram!"
        onPress={openInstagram}
        left={(props) => (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#C13584",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              alignSelf: "center",
            }}
          >
            <Icon name="instagram" size={24} color="white" />
          </View>
        )}
        right={(props) => <Icon name="chevron-right" size={16} color="#666" style={{ alignSelf: "center" }} />}
      />
    </ScrollView>
  )
}
