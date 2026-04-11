import { StyleSheet } from "react-native-unistyles";

import { theme } from "./theme";

const appThemes = { main: theme };
type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: appThemes,
  settings: { initialTheme: "main" },
});
