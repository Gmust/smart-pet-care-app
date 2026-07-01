import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { CirclePlusIcon } from "@/icons/circle-plus";
import { ReminderDrawers } from "@/reminders/components/ReminderDrawers";
import { useReminderActions } from "@/reminders/hooks/useReminderActions";
import { useGetReminders } from "@/reminders/queries/useGetReminders";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { RemindersSectionSkeleton } from "../skeletons/HomePageSkeleton";
import { toReminderGroups } from "../utils/homeMappers";
import { ReminderRow } from "./ReminderRow";
import { SectionLabel } from "./SectionLabel";
import { useRouter } from "expo-router";

type ReminderGroupKey = "overdue" | "today" | "tomorrow" | "soon" | "nextWeek" | "later" | "passed";

export function RemindersSection() {
  const { t } = useTranslation(["home", "reminders", "common"]);
  const router = useRouter();
  const { data: reminders, isLoading } = useGetReminders();
  const groups = useMemo(() => toReminderGroups(reminders ?? []), [reminders]);

  const {
    isCreateOpen,
    setIsCreateOpen,
    editReminderId,
    setEditReminderId,
    statusReminderId,
    setStatusReminderId,
    isDeleting,
    deletingId,
    handleDeleteReminder,
  } = useReminderActions();

  const reminderGroupTitle: Record<ReminderGroupKey, string> = {
    later: t("reminders.groups.later"),
    passed: t("reminders.groups.passed"),
    nextWeek: t("reminders.groups.nextWeek"),
    overdue: t("reminders.groups.overdue"),
    soon: t("reminders.groups.soon"),
    today: t("reminders.groups.today"),
    tomorrow: t("reminders.groups.tomorrow"),
  };

  const handleSeeAllReminders = useCallback(() => {
    router.push("/(tabs)/reminders");
  }, [router]);

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
        ) : groups.length === 0 ? (
          <Button
            variant="ghost"
            size="md"
            dotted
            accessibilityLabel={t("reminders:addReminder")}
            icon={<CirclePlusIcon width={20} height={20} color={palette.brand.textSecondary} />}
            style={styles.addButton}
            textStyle={styles.addButtonText}
            onPress={() => setIsCreateOpen(true)}
          >
            {t("reminders:addReminder")}
          </Button>
        ) : (
          groups.map((group) => (
            <View key={group.key} style={styles.group}>
              <Text style={styles.groupTitle}>{reminderGroupTitle[group.key]}</Text>
              <View style={styles.stack}>
                {group.reminders.map((reminder) => (
                  <ReminderRow
                    key={reminder.id}
                    reminder={reminder}
                    onEdit={() => setEditReminderId(reminder.id)}
                    onChangeStatus={() => setStatusReminderId(reminder.id)}
                    onDelete={() => handleDeleteReminder(reminder.id)}
                    isDeleting={isDeleting && deletingId === reminder.id}
                    muted={group.key === "passed"}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      <ReminderDrawers
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        editReminderId={editReminderId}
        setEditReminderId={setEditReminderId}
        statusReminderId={statusReminderId}
        setStatusReminderId={setStatusReminderId}
      />
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
  addButton: {
    width: "100%",
  },
  addButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.4,
    color: theme.palette.brand.textSecondary,
  },
}));
