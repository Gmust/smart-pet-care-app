// eslint-disable-next-line simple-import-sort/imports
import "@/i18n";

import { useEffect } from "react";
import { StatusBar } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { Fraunces_700Bold } from "@expo-google-fonts/fraunces";

import { AuthProvider } from "@/auth/context/AuthContext";
import AppProvider from "@/common/providers/AppProvider";

import "@/styles/config";
import "dayjs/locale/en.js";
import "dayjs/locale/ru.js";
import "dayjs/locale/uk.js";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isToday from "dayjs/plugin/isToday";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useFonts } from "expo-font";
import { NavigationBar } from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(isToday);

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_700Bold,
  });

  useEffect(() => {
    NavigationBar.setHidden(true);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AppProvider>
      <AuthProvider>
        <StatusBar hidden />
        <RootNavigator />
      </AuthProvider>
    </AppProvider>
  );
}

function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#001433" } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
