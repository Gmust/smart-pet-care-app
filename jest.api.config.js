// Contract tests that call the real backend at EXPO_PUBLIC_API_URL.
// Kept out of `pnpm test`, pre-push and CI: they need the network and a live server.
const path = require("node:path");

try {
  // Does not override variables already set, so `API_TEST_EMAIL=... pnpm test:api` wins.
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  // No .env (e.g. CI): the variables must come from the environment.
}

const { moduleNameMapper, transformIgnorePatterns } = require("./jest.config");

module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.api-test.ts"],
  moduleNameMapper,
  // babel-preset-expo turns `process.env.EXPO_PUBLIC_*` into an ESM import of
  // expo/virtual/env, so expo has to be transformed here too.
  transformIgnorePatterns,
  testTimeout: 20000,
};
