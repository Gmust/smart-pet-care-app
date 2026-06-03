import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Fab } from "@/common/components/fab";
import { TabBar } from "@/common/components/tab-bar";

import "@/styles/config";
import { Tabs } from "expo-router";

const tabs = ["home", "pets", "activity", "profile"] as const;

export default function TabLayout() {
  const { t } = useTranslation(["common"]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {tabs.map((item) => (
          <Tabs.Screen key={item} name={item} options={{ title: t(`navigationTabs.${item}`) }} />
        ))}
      </Tabs>
      <Fab />
    </View>
  );
}
