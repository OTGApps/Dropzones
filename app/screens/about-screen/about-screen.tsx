import { FunctionComponent as Component } from "react"
import { Linking, ScrollView, View, ViewStyle, TextStyle } from "react-native"
import * as Application from "expo-application"
import { Card, List } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { $chevronRight } from "@/theme/styles"

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
  const { themed, theme: { colors } } = useAppTheme()

  return (
    <ScrollView style={themed($container)}>
      <Card style={themed($logoCard)}>
        <Card.Cover source={require("./logo.png")} resizeMode="contain" style={themed($logoCover)} />
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
          <View style={themed($githubIconContainer)}>
            <Icon name="github" size={24} color={colors.palette.neutral100} />
          </View>
        )}
        right={(props) => <Icon name="chevron-right" size={16} style={themed($chevronRight)} />}
      />
      <List.Item
        title="Icon design by euphoria.art.studios"
        description="Check her out on Instagram!"
        onPress={openInstagram}
        left={(props) => (
          <View style={themed($instagramIconContainer)}>
            <Icon name="instagram" size={24} color={colors.palette.neutral100} />
          </View>
        )}
        right={(props) => <Icon name="chevron-right" size={16} style={themed($chevronRight)} />}
      />
    </ScrollView>
  )
}

// ThemedStyle constants
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $logoCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  margin: spacing.sm,
})

const $logoCover: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
})

const $githubIconContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.neutral700,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.sm,
  alignSelf: "center",
})

const $instagramIconContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "#C13584", // Instagram brand color - keep consistent
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.sm,
  alignSelf: "center",
})
