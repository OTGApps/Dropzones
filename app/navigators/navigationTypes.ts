import { ComponentProps } from "react"
import { NavigationContainer } from "@react-navigation/native"

export type AppStackParamList = {
  [key: string]: object | undefined
}

export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppStackParamList>>
> {}
