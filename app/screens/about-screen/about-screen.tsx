import { FC, useCallback, useEffect, useState } from "react"
import { Alert, Linking, ScrollView, View, ViewStyle, TextStyle } from "react-native"
import * as Application from "expo-application"
import { ActivityIndicator, Card, List, ProgressBar, Text } from "react-native-paper"
import Icon from "react-native-vector-icons/FontAwesome"

import Config from "@/config"
import { useDatabase, seedDatabase, LOCAL_DATA_VERSION } from "@/database"
import {
  checkForUpdates,
  applyUpdate,
  getLastUpdateCheck,
  setLastUpdateCheck,
} from "@/services/data-update"
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
  const { db } = useDatabase()

  const [isChecking, setIsChecking] = useState(false)
  const [dataVersion, setDataVersion] = useState(LOCAL_DATA_VERSION)
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const [resetProgress, setResetProgress] = useState<{ current: number; total: number } | null>(
    null,
  )

  // Load the current data version from the database
  useEffect(() => {
    async function loadDataVersion() {
      if (!db) return
      try {
        const result = await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM metadata WHERE key = 'data_version'",
        )
        if (result?.value) {
          setDataVersion(result.value)
        }
      } catch {
        // Use config version as fallback
      }
    }
    loadDataVersion()
    setLastChecked(getLastUpdateCheck())
  }, [db])

  const handleCheckForUpdates = useCallback(async () => {
    if (!db || isChecking) return

    setIsChecking(true)
    try {
      const result = await checkForUpdates(db)
      setLastUpdateCheck(new Date().toISOString())
      setLastChecked(new Date().toISOString())

      if (result.error) {
        Alert.alert("Check Failed", result.error)
        return
      }

      if (result.hasUpdate) {
        Alert.alert(
          "Update Available",
          `New dropzone data is available (version ${result.remoteVersion}). Would you like to update now?`,
          [
            { text: "Later", style: "cancel" },
            {
              text: "Update",
              onPress: async () => {
                setIsChecking(true)
                const updateResult = await applyUpdate(db)
                setIsChecking(false)
                if (updateResult.success) {
                  setDataVersion(updateResult.newVersion || dataVersion)
                  Alert.alert(
                    "Update Complete",
                    `Successfully updated to version ${updateResult.newVersion} with ${updateResult.dropzoneCount} dropzones.`,
                  )
                } else {
                  Alert.alert("Update Failed", updateResult.error || "Unknown error occurred.")
                }
              },
            },
          ],
        )
      } else {
        Alert.alert(
          "Up to Date",
          `Your dropzone data is up to date (version ${result.currentVersion}).`,
        )
      }
    } finally {
      setIsChecking(false)
    }
  }, [db, isChecking, dataVersion])

  const handleResetDatabase = useCallback(async () => {
    if (!db || isChecking) return

    Alert.alert(
      "Reset Database",
      "This will delete all dropzone data and reload from the bundled file. This action cannot be undone. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setIsChecking(true)
            setResetProgress(null)
            try {
              // Delete all dropzones
              await db.runAsync("DELETE FROM dropzones")
              // Delete version metadata to force reseed
              await db.runAsync("DELETE FROM metadata WHERE key = 'data_version'")
              // Reseed from local file with progress tracking
              await seedDatabase(db, (current, total) => {
                setResetProgress({ current, total })
              })
              // Reload current version
              const result = await db.getFirstAsync<{ value: string }>(
                "SELECT value FROM metadata WHERE key = 'data_version'",
              )
              if (result?.value) {
                setDataVersion(result.value)
              }
              Alert.alert(
                "Database Reset",
                "Successfully reset and reloaded dropzone data from local file.",
              )
            } catch (error) {
              Alert.alert("Reset Failed", error instanceof Error ? error.message : "Unknown error")
            } finally {
              setIsChecking(false)
              setResetProgress(null)
            }
          },
        },
      ],
    )
  }, [db, isChecking])

  const formatDescription = () => {
    const versionLine = `Data version: ${dataVersion}`
    if (!lastChecked) return `${versionLine}\nNever checked`
    try {
      const date = new Date(lastChecked)
      return `${versionLine}\nLast checked: ${date.toLocaleDateString()}`
    } catch {
      return `${versionLine}\nNever checked`
    }
  }

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
          <List.Item
            title="Check for Data Updates"
            description={
              resetProgress
                ? `Resetting database... ${resetProgress.current} / ${resetProgress.total} (${Math.round((resetProgress.current / resetProgress.total) * 100)}%)`
                : isChecking
                  ? "Checking..."
                  : formatDescription()
            }
            onPress={handleCheckForUpdates}
            onLongPress={handleResetDatabase}
            disabled={isChecking || !db}
            left={() => (
              <View style={themed($updateIconContainer)}>
                <Icon name="refresh" size={24} color={colors.palette.neutral100} />
              </View>
            )}
            right={() =>
              isChecking ? (
                resetProgress ? (
                  <View style={themed($progressContainer)}>
                    <ProgressBar
                      progress={resetProgress.current / resetProgress.total}
                      style={themed($progressBar)}
                    />
                  </View>
                ) : (
                  <ActivityIndicator size="small" style={themed($activityIndicator)} />
                )
              ) : (
                <Icon name="chevron-right" size={16} style={themed($chevronRight)} />
              )
            }
          />
          <List.Item
            title="Dropzones is open source!"
            description="Go to Github to find out more"
            onPress={openGithub}
            left={() => (
              <View style={themed($githubIconContainer)}>
                <Icon name="github" size={24} color={colors.palette.neutral100} />
              </View>
            )}
            right={() => <Icon name="chevron-right" size={16} style={themed($chevronRight)} />}
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

const $updateIconContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.secondary500,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.sm,
  alignSelf: "center",
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

const $activityIndicator: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "center",
})

const $progressContainer: ThemedStyle<ViewStyle> = () => ({
  width: 100,
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
})

const $progressBar: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  height: 4,
})
