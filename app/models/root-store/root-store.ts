import { getSnapshot, Instance, SnapshotOut, types } from "mobx-state-tree"
import _ from "lodash"
import { Dropzone, DropzoneModel } from "../dropszones/dropzones"
import { LocationObject } from "expo-location"

const dropzoneData = require("./dropzones.json")

/**
 * A RootStore model.
 */
// prettier-ignore
export const RootStoreModel = types.model("RootStore").props({
  dropzones: types.array(DropzoneModel),
  // flags: types.array(types.number)
}).actions(self => ({
  afterCreate() {
    self.dropzones = dropzoneData.features.map((f: any) => {
      return {
        ...f.properties,
        anchor: f.properties.anchor.toString(),
        coordinates: {
          longitude: f.geometry.coordinates[0],
          latitude: f.geometry.coordinates[1]
        } // as LatLng
      } as Dropzone
    })

    // Uncomment this to reset the flag database
    // self.flags.replace([])
  },
  // addFlag (anchor: number) {
  //   self.flags.replace([anchor, ...self.flags])
  // },
  // removeFlag (anchor: number) {
  //   self.flags.replace(_.filter(self.flags, f => (f !== anchor)))
  // }
})).views(self => ({
  dropzoneById(anchor) {
    return getSnapshot(_.find(self.dropzones, d => (parseInt(d.anchor) === parseInt(anchor)))) as Dropzone
  },
  // Gets all the dropzones that have flags
  // get flaggedDropzones () {
  //   if (__DEV__) console.tron.log('flags', self.flags)
  //   if (__DEV__) console.tron.log('', _.filter(self.dropzones, (d) => _.includes(self.flags, d.anchor)))

  //   return _.filter(self.dropzones, (d) => _.includes(self.flags, d.anchor))
  // },

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
    )).slice().sort()
  },
})).views(self=>({
  get uniqueAircraftSorted () {
    const allAircraft = self.uniqueAircraft
    return [
      {
        title: "Antonov",
        data: _.remove(allAircraft, (a: string) => a.toLowerCase().includes("antonov"))
      }, {
        title: "Atlas",
        data: _.remove(allAircraft, (a: string) => a.toLowerCase().includes("atlas"))
      },
      {
        title: "Beech",
        data: [
          ..._.remove(allAircraft, (a: string) => a.toLowerCase().includes("beech")),
          ..._.remove(allAircraft, (a: string) => a.toLowerCase().includes("king air")),
        ]
      }, {
        title: "de Havilland",
        data: _.remove(allAircraft, (a: string) => a.toLowerCase().includes("otter"))
      }, {
        title: "Douglas",
        data: [
          ..._.remove(allAircraft, (a: string) => a.toLowerCase().includes("dc3")),
          ..._.remove(allAircraft, (a: string) => a.toLowerCase().includes("dc9")),
          ..._.remove(allAircraft, (a: string) => a.toLowerCase().includes("dc-3")),
          ..._.remove(allAircraft, (a: string) => a.toLowerCase().includes("dc-9")),
        ]
      }, {
        title: "Cessna",
        data: _.remove(allAircraft, (a: string) => a.toLowerCase().includes("cessna"))
      }, {
        title: "PAC",
        data: _.remove(allAircraft, (a: string) => a.toLowerCase().includes("pac"))
      }, {
        title: "Pilatus",
        data: _.remove(allAircraft, (a: string) => a.toLowerCase().includes("pilatus"))
      }, {
        title: "Piper",
        data: _.remove(allAircraft, (a: string) => a.toLowerCase().includes("piper"))
      }, {
        title: "Other",
        data: [...allAircraft]
      }
    ]
  },
  // Lists all unique service names
  get uniqueServices () {
    return _.uniq(_.flatMap(self.dropzones, ({ services }) => _.map(services))).slice().sort()
  },
  // Lists all unique training capabilities
  get uniqueTraining () {
    return _.uniq(_.flatMap(self.dropzones, ({ training }) => _.map(training))).slice().sort()
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
  sortByDistanceFrom (location: LocationObject) {
    if (__DEV__) console.tron.log('sortByDistanceFrom', location)
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

/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
