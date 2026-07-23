import { ComponentProps } from "react"
import type { LocationObject } from "expo-location"
import { NavigationContainer } from "@react-navigation/native"

// Every screen name reachable via navigation.navigate() anywhere in the app,
// across the tab/stack navigators (tab-navigator, primary-stack, primary-navigator,
// map-stack, map-navigator).
export type AppRootParamList = {
  "dropzones": undefined
  "map": undefined
  "primaryStack": undefined
  "mapStack": undefined
  "about": undefined
  "welcome": undefined
  "alphabetical": undefined
  "list-detail": { item: string; itemType: string; title: string }
  "near-me": { location: LocationObject | null }
  "dropzone-detail": { anchor: string; title: string }
  "by-state": undefined
  "by-aircraft": undefined
  "by-services": undefined
  "by-training": undefined
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required by react-navigation's global RootParamList augmentation pattern
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends AppRootParamList {}
  }
}

export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppRootParamList>>
> {}
