import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import "@/styles/config";
import { reminders } from "../data";
import type { ReminderStatus } from "../types";
import { ReminderRow } from "./ReminderRow";
import { SectionLabel } from "./SectionLabel";

type RemindersSectionProps = {
  onActiveCountChange: (count: number) => void;
  onStatusChange: (message: string) => void;
};

export function RemindersSection({ onActiveCountChange, onStatusChange }: RemindersSectionProps) {
  const { t } = useTranslation(["home"]);
  const [todayReminders, setTodayReminders] = useState(reminders);

  const activeReminderCount = useMemo(
    () => todayReminders.filter((reminder) => reminder.status !== "done").length,
    [todayReminders]
  );

  useEffect(() => {
    onActiveCountChange(activeReminderCount);
  }, [activeReminderCount, onActiveCountChange]);

  const handleReminderPress = useCallback(
    (id: string) => {
      setTodayReminders((current) =>
        current.map((reminder) => {
          if (reminder.id !== id) {
            return reminder;
          }

          const nextStatus: ReminderStatus = reminder.status === "done" ? "pending" : "done";
          onStatusChange(
            nextStatus === "done"
              ? t("mockStatus.reminderDone", { title: reminder.title })
              : t("mockStatus.reminderReopened", { title: reminder.title })
          );
          return { ...reminder, status: nextStatus };
        })
      );
    },
    [onStatusChange, t]
  );

  const handleSeeAllReminders = useCallback(() => {
    onStatusChange(t("mockStatus.seeAllReminders", { count: todayReminders.length }));
  }, [onStatusChange, t, todayReminders.length]);

  return (
    <>
      <SectionLabel
        title={t("sectionLabel.remindersAmount.title", { remindersAmount: activeReminderCount })}
        action={t("sectionLabel.remindersAmount.action")}
        onActionPress={handleSeeAllReminders}
      />
      <View style={styles.stack}>
        {todayReminders.map((reminder) => (
          <ReminderRow
            key={reminder.id}
            reminder={reminder}
            onPress={() => handleReminderPress(reminder.id)}
          />
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  stack: {
    gap: theme.spacing(2),
  },
}));
