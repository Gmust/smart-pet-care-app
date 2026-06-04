import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

import { HeaderSection } from "../components/HeaderSection";
import { InsightSection } from "../components/InsightSection";
import { PetOverviewSection } from "../components/PetOverviewSection";
import { QuickActionsSection } from "../components/QuickActionsSection";
import { RemindersSection } from "../components/RemindersSection";
import { TimelineSection } from "../components/TimelineSection";
import { recentEvents } from "../data";
import type { TimelineEvent } from "../types";

const HomePage = () => {
  const { t } = useTranslation(["home"]);
  const [events, setEvents] = useState(recentEvents);
  const [activeReminderCount, setActiveReminderCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState(t("mockStatus.ready"));

  const addEvent = useCallback((event: TimelineEvent) => {
    setEvents((current) => [event, ...current].slice(0, 5));
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <HeaderSection
          activeReminderCount={activeReminderCount}
          onStatusChange={setStatusMessage}
        />
        {/* Currently unused, might be needed later*/}
        {/* <PetSwitcher /> */}
        <PetOverviewSection onStatusChange={setStatusMessage} />

        {!!statusMessage && (
          <View style={styles.statusCard} accessibilityLiveRegion="polite">
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        <InsightSection onAddEvent={addEvent} onStatusChange={setStatusMessage} />
        <RemindersSection
          onActiveCountChange={setActiveReminderCount}
          onStatusChange={setStatusMessage}
        />
        <QuickActionsSection onAddEvent={addEvent} onStatusChange={setStatusMessage} />
        <TimelineSection events={events} onStatusChange={setStatusMessage} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  content: {
    paddingHorizontal: theme.spacing(5),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(28),
    gap: theme.spacing(4),
  },
  statusCard: {
    backgroundColor: theme.palette.brand.primaryXsoft,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.palette.brand.primarySoft,
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.5),
  },
  statusText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.primaryDark,
  },
}));

export default HomePage;
