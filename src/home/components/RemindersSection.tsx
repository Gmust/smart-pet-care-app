import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useGetReminders } from "@/reminders/queries/useGetReminders";
import { Text } from "@/shadecn/ui/text";

import { RemindersSectionSkeleton } from "../skeletons/HomePageSkeleton";
import { toReminderGroups } from "../utils/homeMappers";
import { ReminderRow } from "./ReminderRow";
import { SectionLabel } from "./SectionLabel";

type ReminderGroupKey = "overdue" | "today" | "tomorrow" | "soon" | "nextWeek" | "later";

export function RemindersSection() {
  const { t } = useTranslation(["home"]);
  const { data: reminders, isLoading } = useGetReminders();
  const groups = useMemo(() => toReminderGroups(reminders ?? []), [reminders]);

  const reminderGroupTitle: Record<ReminderGroupKey, string> = {
    later: t("reminders.groups.later"),
    nextWeek: t("reminders.groups.nextWeek"),
    overdue: t("reminders.groups.overdue"),
    soon: t("reminders.groups.soon"),
    today: t("reminders.groups.today"),
    tomorrow: t("reminders.groups.tomorrow"),
  };

  const handleReminderPress = useCallback((id: string) => {
    // TODO(api): call reminder acknowledgement from a mutation hook.
    void id;
  }, []);

  const handleSeeAllReminders = useCallback(() => {
    // TODO(navigation): route to full reminders screen when it exists.
  }, []);

  return (
    <>
      <SectionLabel
        title={t("sectionLabel.remindersAmount.title")}
        action={t("sectionLabel.remindersAmount.action")}
        onActionPress={handleSeeAllReminders}
      />
      <View style={styles.groups}>
        {isLoading ? (
          <RemindersSectionSkeleton />
        ) : (
          groups.map((group) => (
            <View key={group.key} style={styles.group}>
              <Text style={styles.groupTitle}>{reminderGroupTitle[group.key]}</Text>
              <View style={styles.stack}>
                {group.reminders.map((reminder) => (
                  <ReminderRow
                    key={reminder.id}
                    reminder={reminder}
                    onPress={() => handleReminderPress(reminder.id)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  groups: {
    gap: theme.spacing(4),
  },
  group: {
    gap: theme.spacing(2),
  },
  groupTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.palette.brand.textSecondary,
  },
  stack: {
    gap: theme.spacing(2),
  },
}));
