import { palette } from "@/styles/palette";

import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.yellow[300],
        tabBarInactiveTintColor: palette.gray[300],
        headerShown: false,
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Test 1",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Test 2",
        }}
      />
    </Tabs>
  );
}
