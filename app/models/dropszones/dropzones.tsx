import { Instance, SnapshotOut, types } from "mobx-state-tree"
import ParseAddress from "parse-address"
import distanceCalculator from "../../utils/lat-long-to-km"
import _ from "lodash"
import { LocationObject } from "expo-location"

export const DropzoneModel = types
  .model("Dropzone", {
    anchor: types.identifier,
    flagged: types.optional(types.boolean, false),
    name: types.string,
    email: types.string,
    description: types.optional(types.string, ""),
    phone: types.optional(types.string, ""),
    website: types.optional(types.string, ""),
    aircraft: types.optional(types.array(types.string), []),
    location: types.optional(types.array(types.string), []),
    services: types.optional(types.array(types.string), []),
    training: types.optional(types.array(types.string), []),
    coordinates: types.model({
      longitude: types.number,
      latitude: types.number,
    }),
  })
  .views((self) => ({
    // Returns the first letter of the name of the dropzone
    get nameFirstLetter() {
      return self.name[0].toUpperCase()
    },

    // Parses the location array and if it's in a state, figure it out!
    get state() {
      const parsed = ParseAddress.parseLocation(self.location.join(". "))
      if (parsed && parsed.state && parsed.zip && parsed.zip !== "66798") {
        return parsed.state.toUpperCase()
      }
      return "International"
    },

    // Returns a string of text that we can use to search the data of each dropzone
    get searchableText() {
      return [self.name, self.description, self.website].join(" ").toLowerCase()
    },

    // Calculates this dz's distance from a location (in km)
    distanceFrom(location: LocationObject) {
      const distance = distanceCalculator(
        location.coords.latitude,
        location.coords.longitude,
        self.coordinates.latitude,
        self.coordinates.longitude,
      )
      return distance
    },
  }))

export interface Dropzone extends Instance<typeof DropzoneModel> {}
export interface DropzoneSnapshot extends SnapshotOut<typeof DropzoneModel> {}
