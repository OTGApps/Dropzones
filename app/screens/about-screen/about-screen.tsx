import { FC } from "react"
import { Linking, ScrollView, View, ViewStyle, TextStyle } from "react-native"
import * as Application from "expo-application"
import { Card, List, Text } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import { useAppTheme } from "@/theme/context"
import { $chevronRight } from "@/theme/styles"
import { ThemedStyle } from "@/theme/types"

const openWeb = (website: string) => {
  Linking.canOpenURL(website).then((supported) => {
    if (supported) {
      Linking.openURL(website)
    }
  })
}
const openGithub = () => openWeb("https://github.com/OTGApps/Dropzones")

export const AboutScreen: FC = () => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <ScrollView style={themed($container)}>
      <Card style={themed($logoCard)}>
        <Card.Cover
          source={require("./logo.png")}
          resizeMode="contain"
          style={themed($logoCover)}
        />
        <Card.Title
          title="Dropzones!"
          subtitle="USPA Dropzone Finder"
          titleStyle={themed($cardTitle)}
        />
        <Card.Content style={themed($cardContent)}>
          <Text variant="bodyMedium" style={themed($versionText)}>
            Version {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
          </Text>
          <Text variant="bodyMedium" style={themed($dataDateText)}>
            Data updated: 9/4/2021
          </Text>
          <List.Item
            title="Dropzones is open source!"
            description="Go to Github to find out more"
            onPress={openGithub}
            left={(props) => (
              <View style={themed($githubIconContainer)}>
                <Icon name="github" size={24} color={colors.palette.neutral100} />
              </View>
            )}
            right={(props) => <Icon name="chevron-right" size={16} style={themed($chevronRight)} />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

// ThemedStyle constants
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $logoCard: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  margin: spacing.md,
  marginBottom: spacing.lg,
})

const $logoCover: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
})

const $cardTitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 24,
  fontWeight: "bold",
})

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.xs,
  gap: spacing.xs,
})

const $versionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $dataDateText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.palette.neutral600,
  marginTop: spacing.xxs,
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
