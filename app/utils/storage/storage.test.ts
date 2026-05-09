import { load, loadString, save, saveString, clear, remove, storage } from "."

const VALUE_OBJECT = { x: 1 }
const VALUE_STRING = JSON.stringify(VALUE_OBJECT)

describe("MMKV Storage", () => {
  beforeEach(() => {
    storage.clearAll()
    // "rawstring" stores a non-JSON plain string (via the underlying MMKV API)
    // "string" stores a properly JSON-encoded string (via save())
    // "object" stores a properly JSON-encoded object (via save())
    storage.set("rawstring", "rawstring")
    save("string", "string")
    save("object", VALUE_OBJECT)
  })

  it("should be defined", () => {
    expect(storage).toBeDefined()
  })

  it("should have default keys", () => {
    expect(storage.getAllKeys()).toEqual(["rawstring", "string", "object"])
  })

  it("should load data", () => {
    expect(load<object>("object")).toEqual(VALUE_OBJECT)
    expect(loadString("object")).toEqual(VALUE_STRING)

    // load() expects JSON-encoded values and returns null for non-JSON raw strings
    expect(load<string>("rawstring")).toBeNull()
    expect(loadString("rawstring")).toEqual("rawstring")

    // load() correctly parses JSON-encoded strings
    expect(load<string>("string")).toEqual("string")
  })

  it("should save strings", () => {
    saveString("string", "new string")
    expect(loadString("string")).toEqual("new string")
  })

  it("should save objects", () => {
    save("object", { y: 2 })
    expect(load<object>("object")).toEqual({ y: 2 })
    save("object", { z: 3, also: true })
    expect(load<object>("object")).toEqual({ z: 3, also: true })
  })

  it("should save strings and objects", () => {
    saveString("object", "new string")
    expect(loadString("object")).toEqual("new string")
  })

  it("should remove data", () => {
    remove("object")
    expect(load<object>("object")).toBeNull()
    expect(storage.getAllKeys()).toEqual(["rawstring", "string"])

    remove("string")
    expect(load<string>("string")).toBeNull()
    expect(storage.getAllKeys()).toEqual(["rawstring"])
  })

  it("should clear all data", () => {
    expect(storage.getAllKeys()).toEqual(["rawstring", "string", "object"])
    clear()
    expect(storage.getAllKeys()).toEqual([])
  })
})
