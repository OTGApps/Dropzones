/* eslint-env node */
// Wrap Expo's default babel transformer so `.geojson` files become JSON modules.
// This keeps them in Metro's module graph, so editing the data file invalidates
// its importers and hot-reloads in dev (babel-plugin-inline-import did not).
const upstream = require("@expo/metro-config/babel-transformer")

module.exports.transform = function transform(props) {
  if (props.filename.endsWith(".geojson")) {
    // File contents are already valid JSON.
    return upstream.transform({ ...props, src: `module.exports = ${props.src};` })
  }
  return upstream.transform(props)
}
