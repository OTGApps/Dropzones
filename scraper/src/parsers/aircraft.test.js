import assert from "node:assert/strict"
import { test } from "node:test"

import { parseAircraftString } from "./aircraft.js"

test("empty or whitespace input returns an empty array", () => {
  assert.deepEqual(parseAircraftString(""), [])
  assert.deepEqual(parseAircraftString("   "), [])
})

test("pluralizes when quantity is greater than one", () => {
  assert.deepEqual(parseAircraftString("2 Cessna 208 Caravan"), ["2 Cessna 208 Caravans"])
})

test("prefixes a quantity of 1 when none is given", () => {
  assert.deepEqual(parseAircraftString("Twin Otter"), ["1 Twin Otter"])
})

test("splits on and/or, ' Or ', and ' & '", () => {
  assert.deepEqual(parseAircraftString("Twin Otter and/or CASA"), ["1 Twin Otter", "1 Casa"])
  assert.deepEqual(parseAircraftString("2 Otter Or 1 Caravan"), [
    "2 Otters",
    "1 Cessna 208 Caravan",
  ])
  assert.deepEqual(parseAircraftString("3 Cessna 182 & 1 Otter"), ["3 Cessna 182s", "1 Otter"])
})

test("strips trailing '--' comments", () => {
  assert.deepEqual(parseAircraftString("1 Caravan -- turbine"), ["1 Cessna 208 Caravan"])
})

test("normalizes C-### to Cessna ###", () => {
  assert.deepEqual(parseAircraftString("1 C-182"), ["1 Cessna 182"])
})

test("passes through 'Varies'", () => {
  assert.deepEqual(parseAircraftString("Varies"), ["Varies"])
})
