import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { aiInsight, greeting, healthSummary, quickActions, recentEvents, reminders } from "../data";
import { AiInsightCard } from "../components/ai-insight-card";
import { HealthPetCard } from "../components/HealthPetCard";
import { HomeHeader } from "../components/HomeHeader";
import { PetSwitcher } from "../components/PetSwitcher";
import { QuickAction } from "../components/quick-action";
import { ReminderRow } from "../components/reminder-row";
import { SectionLabel } from "../components/section-label";
import { TimelineRow } from "../components/timeline-row";

const HomePage = () => {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HomeHeader date={greeting.date} username={greeting.username} />
        <PetSwitcher />
        <HealthPetCard {...healthSummary} />

        <AiInsightCard insight={aiInsight} />

        <SectionLabel title={`Today · ${reminders.length} reminders`} action="See all" />
        <View style={styles.stack}>
          {reminders.map((reminder) => (
            <ReminderRow key={reminder.id} reminder={reminder} />
          ))}
        </View>

        <SectionLabel title="Quick actions" />
        <View style={styles.grid}>
          {quickActions.map((item) => (
            <QuickAction key={item.id} item={item} />
          ))}
        </View>

        <SectionLabel title="Recent" action="Open timeline" />
        <View style={styles.timelineCard}>
          {recentEvents.map((event, index) => (
            <TimelineRow key={event.id} event={event} last={index === recentEvents.length - 1} />
          ))}
        </View>
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
    paddingBottom: theme.spacing(10),
    gap: theme.spacing(4),
  },
  stack: {
    gap: theme.spacing(2),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  timelineCard: {
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    overflow: "hidden",
  },
}));

export default HomePage;
