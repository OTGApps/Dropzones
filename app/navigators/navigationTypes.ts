import { ComponentProps } from "react"
import type { LocationObject } from "expo-location"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"

// Demo Tab Navigator types
export type DemoTabParamList = {
  DemoCommunity: undefined
  DemoShowroom: { queryIndex?: string; itemIndex?: string }
  DemoDebug: undefined
  DemoPodcastList: undefined
}

// App Stack Navigator types
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  Demo: NavigatorScreenParams<DemoTabParamList>
  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type DemoTabScreenProps<T extends keyof DemoTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<DemoTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppStackParamList>>
> {}

// Primary Stack Navigator types
export type PrimaryParamList = {
  "welcome": undefined
  "alphabetical": undefined
  "map": undefined
  "list-detail": { item: string; itemType: string; title: string }
  "near-me": { location: LocationObject }
  "dropzone-detail": { anchor: string; title: string }
  "by-state": undefined
  "by-aircraft": undefined
  "by-services": undefined
  "by-training": undefined
  "about": undefined
}

export type PrimaryNavigationProp = NativeStackNavigationProp<PrimaryParamList>

/** Routes that take no params — safe targets for dynamic `navigate(name)` calls. */
export type ParamlessRoute = {
  [K in keyof PrimaryParamList]: PrimaryParamList[K] extends undefined ? K : never
}[keyof PrimaryParamList]
