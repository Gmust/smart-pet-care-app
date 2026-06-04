// eslint-disable-next-line simple-import-sort/imports
import "@/styles/config";

import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Fab } from "@/common/components/Fab";
import { TabBar } from "@/common/components/TabBar";

import { Tabs } from "expo-router";

const tabs = ["home", "pets", "activity", "profile"] as const;

export default function TabLayout() {
  const { t } = useTranslation(["common"]);

  return (
    <View style={styles.root}>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
