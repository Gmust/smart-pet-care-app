import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { ReminderStatus } from "@/api/generated";
import { ReminderRow } from "@/home/components/ReminderRow";
import { RemindersSectionSkeleton } from "@/home/skeletons/HomePageSkeleton";
import type { ReminderGroupKey } from "@/home/types";
import { toReminderGroups } from "@/home/utils/homeMappers";
import { Chevron } from "@/icons/arrows";
import { CirclePlusIcon } from "@/icons/circle-plus";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import { ReminderDrawers } from "../components/ReminderDrawers";
import { useReminderActions } from "../hooks/useReminderActions";
import { useGetReminders } from "../queries/useGetReminders";
import { useRouter } from "expo-router";

type ReminderFilter = "all" | "active" | "completed" | "missed";

const FILTERS: ReminderFilter[] = ["all", "active", "completed", "missed"];

export default function RemindersPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(["reminders", "common"]);

  const { data: reminders, isLoading } = useGetReminders();

  const [filter, setFilter] = useState<ReminderFilter>("all");

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return (reminders ?? []).filter((reminder) => reminder.status === ReminderStatus.Active);
      case "completed":
        return (reminders ?? []).filter((reminder) => reminder.status === ReminderStatus.Completed);
      case "missed":
        return (reminders ?? []).filter((reminder) => reminder.status === ReminderStatus.Missed);
      default:
        return reminders ?? [];
    }
  }, [reminders, filter]);
  const groups = useMemo(() => toReminderGroups(filtered), [filtered]);

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

  const totalCount = reminders?.length ?? 0;

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
                {t("reminders:remindersPage.subtitle", { count: totalCount })}
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
          {FILTERS.map((item) => {
            const isActive = item === filter;

            return (
              <Pressable
                key={item}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => setFilter(item)}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {t(`reminders:remindersPage.filters.${item}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
        >
          {isLoading ? (
            <RemindersSectionSkeleton />
          ) : groups.length === 0 ? (
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
          ) : (
            groups.map((group) => (
              <View key={group.key} style={styles.group}>
                <Text style={styles.groupTitle}>{groupTitle[group.key]}</Text>
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
        </ScrollView>
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
    flexDirection: "row",
    gap: theme.spacing(2),
    paddingHorizontal: theme.spacing(4),
    paddingBottom: theme.spacing(3),
  },
  filterTab: {
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(1.5),
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    backgroundColor: theme.palette.white,
  },
  filterTabActive: {
    borderColor: theme.palette.brand.primaryDefault,
    backgroundColor: theme.palette.brand.primarySoft,
  },
  filterText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
  filterTextActive: {
    fontFamily: theme.fonts.semiBold,
    color: theme.palette.brand.primaryDark,
  },
  content: {
    gap: theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(28),
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
