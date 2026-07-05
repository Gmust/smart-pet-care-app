import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { useQueryClient } from "@tanstack/react-query";

import { HeaderSection } from "../components/HeaderSection";
import { InsightSection } from "../components/InsightSection";
import { PetOverviewSection } from "../components/PetOverviewSection";
import { RemindersSection } from "../components/RemindersSection";

const HomePage = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["profile", "me"] }),
        queryClient.refetchQueries({ queryKey: ["pets"] }),
      ]);
    } catch (error) {
      console.error("Failed to refresh queries", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <HeaderSection />
        <PetOverviewSection />

        <InsightSection />
        <RemindersSection />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  content: {
    paddingHorizontal: theme.spacing(5),
    paddingBottom: theme.spacing(28),
    gap: theme.spacing(4),
  },
}));

export default HomePage;
