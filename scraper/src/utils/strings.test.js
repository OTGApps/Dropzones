import assert from "node:assert/strict"
import { test } from "node:test"

import { normalizeWhitespace, titleize } from "./strings.js"

test("normalizeWhitespace collapses runs of whitespace and trims", () => {
  assert.equal(normalizeWhitespace("  a   b\n\tc  "), "a b c")
})

test("titleize capitalizes each word and lowercases the rest", () => {
  assert.equal(titleize("SKYDIVE the ranch"), "Skydive The Ranch")
})

test("titleize leaves an excluded word untouched", () => {
  assert.equal(titleize("hello world", ["world"]), "Hello world")
})
