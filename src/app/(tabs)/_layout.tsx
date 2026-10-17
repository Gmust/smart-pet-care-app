// eslint-disable-next-line simple-import-sort/imports
import "@/styles/config";

import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/auth/hooks/useAuth";
import { Fab } from "@/common/components/Fab";
import { OfflineBanner } from "@/common/components/OfflineBanner";
import { TabBar } from "@/common/components/TabBar";

import { Redirect, Tabs, usePathname } from "expo-router";

const tabs = ["home", "pets", "activity", "profile"] as const;

export default function TabLayout() {
  const { t } = useTranslation(["common"]);
  const { status } = useAuth();
  const pathname = usePathname();
  const isAssistantFlow =
    pathname.endsWith("/assistant") ||
    pathname.endsWith("/assistant-pet-selection") ||
    pathname.endsWith("/assistant-new-pet");
  const hideTabBar = isAssistantFlow || pathname.endsWith("/pets/note");

  if (status === "loading") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => (hideTabBar ? null : <TabBar {...props} />)}
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {tabs.map((item) => (
          <Tabs.Screen key={item} name={item} options={{ title: t(`navigationTabs.${item}`) }} />
        ))}
        <Tabs.Screen name="reminders" options={{ href: null }} />
        <Tabs.Screen name="assistant" options={{ href: null }} />
        <Tabs.Screen name="assistant-pet-selection" options={{ href: null }} />
        <Tabs.Screen name="assistant-new-pet" options={{ href: null }} />
      </Tabs>
      {pathname.endsWith("/home") && <Fab />}
      {!isAssistantFlow && <OfflineBanner />}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  // Tab screens cross-fade, and the strip behind them has no colour of its own: it
  // showed the root stack's dark navy for a moment on every switch.
  root: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
}));
