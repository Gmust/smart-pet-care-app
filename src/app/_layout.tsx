// eslint-disable-next-line simple-import-sort/imports
import "@/i18n";

import { useEffect } from "react";
import { StatusBar } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/auth/context/AuthContext";
import AppProvider from "@/common/providers/AppProvider";

import { NavigationBarScrim } from "@/common/components/NavigationBarScrim";

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
import { SystemBars } from "react-native-edge-to-edge";
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
    Fraunces_600SemiBold,
    Fraunces_400Regular,
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AuthProvider>
          <StatusBar hidden />
          <SystemBars style="dark" />
          <RootNavigator />
          <NavigationBarScrim />
        </AuthProvider>
      </AppProvider>
    </GestureHandlerRootView>
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
