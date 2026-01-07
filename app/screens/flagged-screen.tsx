// import { FC } from "react"
// import { observer } from "mobx-react-lite"
// import { useStores } from "../models/root-store/root-store-context"
// import { ViewStyle, FlatList } from "react-native"
// import { DropzoneListRow } from "../components"

// const FULL: ViewStyle = {
//   flex: 1,
// }

// const keyExtractor = (item, index) => index.toString()

// export const FlaggedScreen: FC = observer(function FlaggedScreen() {
//   const { flaggedDropzones } = useStores()

//   const renderItem = ({ item, index }) => <DropzoneListRow item={item} index={index} />

//   return (
//     <FlatList
//       style={themed(FULL)}
//       data={flaggedDropzones}
//       keyExtractor={keyExtractor}
//       renderItem={renderItem}
//       removeClippedSubviews
//     />
//   )
// })
