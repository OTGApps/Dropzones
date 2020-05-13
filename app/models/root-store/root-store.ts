import { Instance, SnapshotOut, types } from "mobx-state-tree"
import ParseAddress from 'parse-address'
import distanceCalculator from '../../utils/lat-long-to-km'
import _ from 'lodash'

const dropzoneData = require('./dropzones.json')

export const DropzoneModel = types.model('Dropzone', {
  anchor: types.number,
  flagged: types.optional(types.boolean, false),
  name: types.string,
  email: types.string,
  description: types.string,
  phone: types.optional(types.string, ''),
  website: types.optional(types.string, ''),
  aircraft: types.optional(types.array(types.string), []),
  location: types.optional(types.array(types.string), []),
  services: types.optional(types.array(types.string), []),
  training: types.optional(types.array(types.string), []),
  coordinates: types.model({
    longitude: types.number,
    latitude: types.number
  })
}).views(self => ({
  // Returns the first letter of the name of the dropzone
  get nameFirstLetter () {
    return self.name[0].toUpperCase()
  },

  // Parses the location array and if it's in a state, figure it out!
  get state () {
    const parsed = ParseAddress.parseLocation(self.location.join(","))
    if (parsed && parsed.state) {
      return parsed.state.toUpperCase()
    }
    return "International"
  },

  // Returns a string of text that we can use to search the data of each dropzone
  get searchableText () {
    return [
      self.name,
      self.description,
      self.website,
    ].join(' ').toLowerCase()
  },

  // Calculates this dz's distance from a location (in km)
  distanceFrom(location: any) {
    const distance = distanceCalculator(
      location.coords.latitude,
      location.coords.longitude,
      self.coordinates.latitude,
      self.coordinates.longitude
    )
    return distance
  }
}))

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore", {
  dropzones: types.array(DropzoneModel),
  flags: types.array(types.number)
}).actions(self => ({
  afterCreate() {
    self.dropzones = dropzoneData.features.map((f: any) => {
      return {
        ...f.properties,
        coordinates: {
          longitude: f.geometry.coordinates[0],
          latitude: f.geometry.coordinates[1]
        } // as LatLng
      } as Dropzone
    })

    self.flags.replace([100357])
  },
  addFlag (anchor: number) {
    self.flags.replace([anchor, ...self.flags])
  },
  removeFlag (anchor: number) {

    self.flags.replace(_.filter(self.flags, f => (f !== anchor)))
  }
})).views(self => ({
  // Gets all the dropzones that have flags
  get flaggedDropzones () {
    if (__DEV__) console.tron.log('flags', self.flags)
    if (__DEV__) console.tron.log('', _.filter(self.dropzones, (d) => _.includes(self.flags, d.anchor)));

    return _.filter(self.dropzones, (d) => _.includes(self.flags, d.anchor))
  },

  // Lists all unique aircraft names
  get uniqueAircraft () {
    return _.uniq(_.flatMap(self.dropzones, ({ aircraft }) =>
      _.map(aircraft, plane => {
        if (plane.match(/[0-9] (.*)/)) {
          const withoutNum = plane.substr(plane.indexOf(' ') + 1)
          return withoutNum.substr(-1) === 's' ? withoutNum.substr(0, withoutNum.length - 1) : withoutNum
        } else {
          return plane
        }
      })
    )).sort()
  },
  // Lists all unique service names
  get uniqueServices () {
    return _.uniq(_.flatMap(self.dropzones, ({ services }) => _.map(services))).sort()
  },
  // Lists all unique training capabilities
  get uniqueTraining () {
    return _.uniq(_.flatMap(self.dropzones, ({ training }) => _.map(training))).sort()
  },
  filteredDropzones (item, itemType: string) {
    return _.filter(self.dropzones, (d) => {
      switch (itemType) {
        case 'state':
          return d.state === item
        default:
          // We want exact matches here           And partial matches here.
          return _.includes(d[itemType], item) || _.includes(d[itemType].join(" "), item)
      }
    })
  },
  // Returns all the dropzones grouped by state so you can count how many are in each.
  groupByState () {
    return _.groupBy(self.dropzones, 'state')
  },
  // Returns all the dropzones grouped by state so you can count how many are in each.
  sortByDistanceFrom (location) {
    console.tron.log('sortByDistanceFrom', location)
    return _.sortBy(_.map(self.dropzones, (dz) => {
      return {
        ...dz,
        distanceFromUser: dz.distanceFrom(location)
      }
    }), 'distanceFromUser')
  }
}))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
export interface Dropzone extends Instance<typeof DropzoneModel> {}
export interface Flag extends Instance<typeof FlagModel> {}

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
