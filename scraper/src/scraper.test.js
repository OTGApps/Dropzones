import assert from "node:assert/strict"
import { test } from "node:test"

import { DZScraper } from "./scraper.js"

const scraper = new DZScraper()

const feature = (properties) => ({ type: "Feature", properties })

test("buildLocationArray assembles address lines and city/state/zip", () => {
  assert.deepEqual(
    scraper.buildLocationArray({
      PhysicalAddressLine1: "1 Runway Rd",
      PhysicalCity: "Town",
      PhysicalState: "CA",
      PhysicalZip: "90001",
      PhysicalCountry: "US",
    }),
    ["1 Runway Rd", "Town, CA, 90001"],
  )
})

test("buildLocationArray abbreviates a full US state name", () => {
  assert.deepEqual(
    scraper.buildLocationArray({
      PhysicalCity: "Lebanon",
      PhysicalState: "Maine",
      PhysicalZip: "04027",
      PhysicalCountry: "US",
    }),
    ["Lebanon, ME, 04027"],
  )
})

test("buildLocationArray leaves a non-US region name alone", () => {
  assert.deepEqual(
    scraper.buildLocationArray({
      PhysicalCity: "Roma",
      PhysicalState: "Lazio",
      PhysicalCountry: "Italy",
    }),
    ["Roma, Lazio", "Italy"],
  )
})

test("buildLocationArray omits a US country but appends a non-US one", () => {
  assert.deepEqual(scraper.buildLocationArray({ PhysicalCity: "Roma", PhysicalCountry: "Italy" }), [
    "Roma",
    "Italy",
  ])
  assert.deepEqual(scraper.buildLocationArray({ PhysicalCity: "Eloy", PhysicalCountry: "US" }), [
    "Eloy",
  ])
})

test("normalizeFeature trims the name", () => {
  const f = feature({ name: "  Skydive X  ", country: "US", state: "CA" })
  scraper.normalizeFeature(f)
  assert.equal(f.properties.name, "Skydive X")
})

test("normalizeFeature applies the country normalization map", () => {
  const f = feature({ name: "X", country: "COLOMBIA", state: "" })
  scraper.normalizeFeature(f)
  assert.equal(f.properties.country, "Colombia")
})

test("normalizeFeature converts a full US state name to its abbreviation", () => {
  const f = feature({ name: "X", country: "US", state: "North Carolina" })
  scraper.normalizeFeature(f)
  assert.equal(f.properties.state, "NC")
})

test("normalizeFeature trims and uppercases a dirty US state code", () => {
  const trailing = feature({ name: "X", country: "US", state: "South Dakota " })
  scraper.normalizeFeature(trailing)
  assert.equal(trailing.properties.state, "SD")

  const lower = feature({ name: "X", country: "US", state: "Ok" })
  scraper.normalizeFeature(lower)
  assert.equal(lower.properties.state, "OK")
})

test("normalizeFeature leaves an already-abbreviated US state untouched", () => {
  const f = feature({ name: "X", country: "US", state: "SC" })
  scraper.normalizeFeature(f)
  assert.equal(f.properties.state, "SC")
})

test("normalizeFeature leaves a non-US region name untouched (beyond trimming)", () => {
  const f = feature({ name: "X", country: "Canada", state: " Ontario " })
  scraper.normalizeFeature(f)
  assert.equal(f.properties.state, "Ontario")
})
