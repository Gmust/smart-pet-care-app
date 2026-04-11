import React from "react";
import { StatusBar } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

import AppProvider from "@/common/providers/AppProvider";

import "@/i18n";
import "dayjs/locale/en.js";
import "dayjs/locale/ru.js";
import "dayjs/locale/uk.js";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isToday from "dayjs/plugin/isToday";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Stack } from "expo-router";

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(isToday);

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar hidden />
      <RootNavigator />
    </AppProvider>
  );
}

function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#001433" } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
