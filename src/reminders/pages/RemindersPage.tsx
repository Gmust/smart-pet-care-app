import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { useRouter } from "expo-router";

import { ReminderStatus } from "@/api/generated";
import { Chevron } from "@/icons/arrows";
import { CirclePlusIcon } from "@/icons/circle-plus";
import { Button } from "@/shadecn/ui/button";
import type { TabItem } from "@/shadecn/ui/tabs";
import { Tabs, tabsContentEntering } from "@/shadecn/ui/tabs";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { ReminderDrawers } from "../components/ReminderDrawers";
import { ReminderRow } from "../components/ReminderRow";
import { useReminderActions } from "../hooks/useReminderActions";
import { useGetReminders } from "../queries/useGetReminders";
import { RemindersSectionSkeleton } from "../skeletons/RemindersSectionSkeleton";
import type { Reminder } from "../types";
import type { ReminderGroupKey } from "../utils/reminderGroups";
import { toReminderGroups } from "../utils/reminderGroups";

type ReminderFilter = "all" | "active" | "completed" | "missed";

const FILTERS: ReminderFilter[] = ["all", "active", "completed", "missed"];

const FILTER_STATUS: Partial<Record<ReminderFilter, ReminderStatus>> = {
  active: ReminderStatus.Active,
  completed: ReminderStatus.Completed,
  missed: ReminderStatus.Missed,
};

const isReminderFilter = (value: string): value is ReminderFilter =>
  FILTERS.some((filter) => filter === value);

// Grouped reminders flattened into one list so FlatList can virtualize rows.
type ReminderListItem =
  | { type: "header"; groupKey: ReminderGroupKey; isFirst: boolean }
  | { type: "reminder"; reminder: Reminder; groupKey: ReminderGroupKey; isFirstInGroup: boolean };

export default function RemindersPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["reminders", "common"]);

  const { data: reminders, isLoading, refetch, isRefetching } = useGetReminders();

  const [filter, setFilter] = useState<ReminderFilter>("all");

  const filtered = useMemo(() => {
    const status = FILTER_STATUS[filter];
    return status
      ? (reminders ?? []).filter((reminder) => reminder.status === status)
      : (reminders ?? []);
  }, [reminders, filter]);
  const groups = useMemo(() => toReminderGroups(filtered), [filtered]);
  const listItems = useMemo(() => {
    const items: ReminderListItem[] = [];
    groups.forEach((group, groupIndex) => {
      items.push({ type: "header", groupKey: group.key, isFirst: groupIndex === 0 });
      group.reminders.forEach((reminder, reminderIndex) => {
        items.push({
          type: "reminder",
          reminder,
          groupKey: group.key,
          isFirstInGroup: reminderIndex === 0,
        });
      });
    });
    return items;
  }, [groups]);

  const {
    isCreateOpen,
    setIsCreateOpen,
    editReminderId,
    setEditReminderId,
    statusReminderId,
    setStatusReminderId,
    descriptionReminderId,
    setDescriptionReminderId,
    isDeleting,
    deletingId,
    handleDeleteReminder,
  } = useReminderActions();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
  }, [router]);

  const groupTitle: Record<ReminderGroupKey, string> = {
    overdue: t("reminders:remindersPage.groups.overdue"),
    today: t("reminders:remindersPage.groups.today"),
    tomorrow: t("reminders:remindersPage.groups.tomorrow"),
    soon: t("reminders:remindersPage.groups.soon"),
    nextWeek: t("reminders:remindersPage.groups.nextWeek"),
    later: t("reminders:remindersPage.groups.later"),
    passed: t("reminders:remindersPage.groups.passed"),
  };

  const filterTabs: TabItem[] = FILTERS.map((item) => ({
    key: item,
    label: t(`reminders:remindersPage.filters.${item}`),
  }));

  return (
    <>
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Button
            size="icon"
            variant="icon"
            accessibilityLabel={t("reminders:remindersPage.goBack")}
            onPress={handleBack}
          >
            <Chevron width={9} height={16} color={palette.brand.textBody} />
          </Button>
          <View style={styles.topBarCopy}>
            <Text style={styles.topBarTitle}>{t("reminders:remindersPage.title")}</Text>
            {!isLoading && (
              <Text style={styles.topBarSubtitle}>
                {t("reminders:remindersPage.subtitle", { count: reminders?.length ?? 0 })}
              </Text>
            )}
          </View>
          <Button
            size="icon"
            variant="icon"
            accessibilityLabel={t("reminders:remindersPage.create")}
            onPress={() => setIsCreateOpen(true)}
          >
            <CirclePlusIcon width={22} height={22} color={palette.brand.primaryDefault} />
          </Button>
        </View>

        <View style={styles.filters}>
          <Tabs
            items={filterTabs}
            value={filter}
            onChange={(key) => {
              if (isReminderFilter(key)) setFilter(key);
            }}
            variant="pill"
          />
        </View>

        <Animated.FlatList
          key={filter}
          entering={tabsContentEntering}
          data={isLoading ? [] : listItems}
          keyExtractor={(item) =>
            item.type === "header" ? `header-${item.groupKey}` : item.reminder.id
          }
          renderItem={({ item }) =>
            item.type === "header" ? (
              <Text style={[styles.groupTitle, !item.isFirst && styles.groupTitleSpacing]}>
                {groupTitle[item.groupKey]}
              </Text>
            ) : (
              <View style={!item.isFirstInGroup && styles.rowSpacing}>
                <ReminderRow
                  reminder={item.reminder}
                  onEdit={() => setEditReminderId(item.reminder.id)}
                  onChangeStatus={() => setStatusReminderId(item.reminder.id)}
                  onShowDescription={() => setDescriptionReminderId(item.reminder.id)}
                  onDelete={() => handleDeleteReminder(item.reminder.id)}
                  isDeleting={isDeleting && deletingId === item.reminder.id}
                  muted={item.groupKey === "passed"}
                />
              </View>
            )
          }
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            isLoading ? (
              <RemindersSectionSkeleton />
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {filter === "all"
                    ? t("reminders:remindersPage.empty.all")
                    : t("reminders:remindersPage.empty.filtered")}
                </Text>
                <Text style={styles.emptyHint}>
                  {filter === "all"
                    ? t("reminders:remindersPage.empty.allHint")
                    : t("reminders:remindersPage.empty.filteredHint")}
                </Text>
                {filter === "all" && (
                  <Button
                    variant="ghost"
                    size="md"
                    dotted
                    accessibilityLabel={t("reminders:addReminder")}
                    icon={
                      <CirclePlusIcon width={20} height={20} color={palette.brand.textSecondary} />
                    }
                    style={styles.addButton}
                    textStyle={styles.addButtonText}
                    onPress={() => setIsCreateOpen(true)}
                  >
                    {t("reminders:addReminder")}
                  </Button>
                )}
              </View>
            )
          }
        />
      </View>

      <ReminderDrawers
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        editReminderId={editReminderId}
        setEditReminderId={setEditReminderId}
        statusReminderId={statusReminderId}
        setStatusReminderId={setStatusReminderId}
        descriptionReminderId={descriptionReminderId}
        setDescriptionReminderId={setDescriptionReminderId}
      />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  topBarCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  topBarTitle: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize["2xl"],
    lineHeight: theme.fontSize["2xl"],
    letterSpacing: -0.12,
    textAlign: "center",
    color: theme.palette.brand.textBody,
  },
  topBarSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
  filters: {
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(3),
  },
  content: {
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(28),
  },
  groupTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.xs,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.palette.brand.textSecondary,
    marginBottom: theme.spacing(2),
  },
  groupTitleSpacing: {
    marginTop: theme.spacing(4),
  },
  rowSpacing: {
    marginTop: theme.spacing(2),
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    paddingVertical: theme.spacing(8),
    paddingHorizontal: theme.spacing(6),
  },
  emptyTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.base,
    color: theme.palette.brand.textPrimary,
  },
  emptyHint: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    textAlign: "center",
    color: theme.palette.brand.textSecondary,
  },
  addButton: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
  addButtonText: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.4,
    color: theme.palette.brand.textSecondary,
  },
}));
