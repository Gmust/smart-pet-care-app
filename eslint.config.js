const { defineConfig } = require("eslint/config");

const globals = require("globals");

const { fixupConfigRules, fixupPluginRules } = require("@eslint/compat");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const reactRefresh = require("eslint-plugin-react-refresh");
const reactHooks = require("eslint-plugin-react-hooks");
const _import = require("eslint-plugin-import");
const js = require("@eslint/js");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const { FlatCompat } = require("@eslint/eslintrc");
const expoConfig = require("eslint-config-expo/flat");
const reactCompiler = require("eslint-plugin-react-compiler");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    ignores: [
      "**/dist/**",
      "**/eslint.config.cjs",
      "**/.eslintrc.cjs",
      "**/vite.config.ts",
      "**/node_modules/**",
      "node_modules/**",
      "**/src/api/generated/**",
      "/dist/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: { ...globals.browser },
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
    },

    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
        "plugin:react-hooks/recommended",
        "plugin:react/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript"
      )
    ),

    settings: {
      react: { version: "detect" },

      "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },

      "import/resolver": { typescript: { alwaysTryTypes: true, project: "./tsconfig.json" } },

      "import/ignore": ["node_modules", "\\.(css|scss|sass|less|styl)$"],
    },

    plugins: {
      react: fixupPluginRules(react),
      "@typescript-eslint": fixupPluginRules(tsPlugin),
      "react-refresh": reactRefresh,
      "react-hooks": fixupPluginRules(reactHooks),
      import: fixupPluginRules(_import),
      "simple-import-sort": fixupPluginRules(simpleImportSort),
    },

    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-console": ["warn", { allow: ["warn", "error"] }],

      //Used across the codebase, heavily dependent
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "off",
      "react/prop-types": 0,
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      "import/no-named-as-default-member": "off",
      "import/default": "off",
      "import/no-unused-modules": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\u0000"],
            ["^react$", "^react", "^@?\\w"],
            ["^@/"],
            ["^\.\.(?!/?$)", "^\.\./?$"],
            ["^\./(?=.*/)(?!/?$)", "^\.(?!/?$)", "^\./?$"],
            ["^.+\\.(css|scss|sass|less|styl)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["src/shadecn/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/styles/palette",
              message: "Use the active Unistyles theme from StyleSheet.create/useUnistyles.",
            },
          ],
        },
      ],
    },
  },
]);
