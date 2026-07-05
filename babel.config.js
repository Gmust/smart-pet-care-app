module.exports = function (api) {
  api.cache(true);

  const isProduction = (process.env.BABEL_ENV || process.env.NODE_ENV) === "production";

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["react-native-unistyles/plugin", { root: "src" }],
      "babel-plugin-react-compiler",
      // Strip console calls before Reanimated's plugin runs, so Reanimated stays last.
      ...(isProduction ? [["transform-remove-console", { exclude: ["error", "warn"] }]] : []),
      // Reanimated's plugin must remain the final entry in the plugins array.
      "react-native-reanimated/plugin",
    ],
  };
};
