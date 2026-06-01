import { TabBar } from "@/common/components/tab-bar";

import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

const tabs = ["home", "pets", "activity", "profile"] as const;

export default function TabLayout() {
  const { t } = useTranslation(["common"]);

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {tabs.map((item) => (
        <Tabs.Screen name={item} options={{ title: t(`navigationTabs.${item}`) }} />
      ))}
    </Tabs>
  );
}
