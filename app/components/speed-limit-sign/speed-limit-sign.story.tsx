import * as React from "react"
import { View, ViewStyle } from 'react-native'
import { storiesOf } from "@storybook/react-native"
import { StoryScreen, Story, UseCase } from "../../../storybook/views"
import { SpeedLimitSign } from "./speed-limit-sign"

declare let module

const COMPONENT_WIDTH = {
  width: 60,
  margin: 10
} as ViewStyle

const CONTAINER = {
  flex: 1,
  flexDirection: 'row',
} as ViewStyle

storiesOf("SpeedLimitStyle", module)
  .addDecorator(fn => <StoryScreen>{fn()}</StoryScreen>)
  .add("Behaviour", () => (
    <Story>
      <UseCase text="The Speed Limit Sign" usage="Use the speed limit sign to show numbers in an interesting way.">
        <View style={CONTAINER}>
          <View style={COMPONENT_WIDTH} >
            <SpeedLimitSign distanceFromUser={'1'} />
          </View>
          <View style={COMPONENT_WIDTH} >
            <SpeedLimitSign distanceFromUser={'100'} />
          </View>
          <View style={COMPONENT_WIDTH} >
            <SpeedLimitSign distanceFromUser={'12.5'} />
          </View>
          <View style={COMPONENT_WIDTH} >
            <SpeedLimitSign distanceFromUser={'876543'} />
          </View>
        </View>
      </UseCase>
    </Story>
  ))
