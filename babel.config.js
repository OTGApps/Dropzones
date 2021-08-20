module.exports = function (api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {},
    },
    plugins: [
      [
        "@babel/plugin-proposal-decorators",
        {
          legacy: true,
        },
      ],
      ["@babel/plugin-proposal-optional-catch-binding"],
      "react-native-reanimated/plugin",
    ],
  }
}
