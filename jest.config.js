// Pinned so date-grouping behavior is identical on every machine and in CI.
// Setting process.env.TZ inside a test file is too late — Node resolves the
// local timezone before the test module runs.
process.env.TZ = "UTC";

module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["react-native-unistyles/mocks", "<rootDir>/src/styles/config.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|@rn-primitives))",
    "/node_modules/react-native-reanimated/plugin/",
    "/node_modules/@react-native/babel-preset/",
  ],
};
