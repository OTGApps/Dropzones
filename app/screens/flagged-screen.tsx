// import React, { FunctionComponent as Component } from "react"
// import { observer } from "mobx-react-lite"
// import { useStores } from "app/models"
// import { ViewStyle, FlatList } from "react-native"
// import { DropzoneListRow } from "../components"

// const FULL: ViewStyle = {
//   flex: 1,
// }

// const keyExtractor = (item, index) => index.toString()

// export const FlaggedScreen: Component = observer(function FlaggedScreen() {
//   const { flaggedDropzones } = useStores()

//   const renderItem = ({ item, index }) => <DropzoneListRow item={item} index={index} />

//   return (
//     <FlatList
//       style={FULL}
//       data={flaggedDropzones}
//       keyExtractor={keyExtractor}
//       renderItem={renderItem}
//       removeClippedSubviews
//     />
//   )
// })
