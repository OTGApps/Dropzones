import assert from "node:assert/strict"
import { test } from "node:test"

import { nextVersion } from "./version.js"

test("resets to .1 on a new day", () => {
  assert.equal(nextVersion("2026.08.29", "2026.01.07.3"), "2026.08.29.1")
})

test("increments N when the previous version is the same day", () => {
  assert.equal(nextVersion("2026.01.07", "2026.01.07.3"), "2026.01.07.4")
})

test("starts at .1 when there is no previous version", () => {
  assert.equal(nextVersion("2026.08.29", undefined), "2026.08.29.1")
})

test("starts at .1 when the previous version is malformed", () => {
  assert.equal(nextVersion("2026.08.29", "not-a-version"), "2026.08.29.1")
  assert.equal(nextVersion("2026.08.29", "2026.08.29"), "2026.08.29.1")
})
