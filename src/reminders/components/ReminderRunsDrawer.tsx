import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import { ReminderRunStatus } from "@/api/generated";
import { Chip, type ChipTone } from "@/shadecn/ui/chip";
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerScrollView,
  DrawerTitle,
} from "@/shadecn/ui/drawer";
import { Text } from "@/shadecn/ui/text";

import { useGetReminderById } from "../queries/useGetReminderById";
import { useGetReminderRuns } from "../queries/useGetReminderRuns";

const RUN_STATUS_TONE: Record<ReminderRunStatus, ChipTone> = {
  [ReminderRunStatus.Pending]: "neutral",
  [ReminderRunStatus.Sent]: "primary",
  [ReminderRunStatus.Delivered]: "primary",
  [ReminderRunStatus.Failed]: "danger",
  [ReminderRunStatus.Missed]: "danger",
  [ReminderRunStatus.Completed]: "ok",
  [ReminderRunStatus.Cancelled]: "neutral",
};

type Props = {
  reminderId: string;
  onClose: () => void;
};

export const ReminderRunsDrawer = ({ reminderId, onClose }: Props) => {
  const { t } = useTranslation(["reminders"]);
  const { data: reminder } = useGetReminderById(reminderId);
  const { data: runs, isLoading } = useGetReminderRuns(reminderId);

  const ordered = [...(runs ?? [])].sort(
    (left, right) => dayjs(right.scheduledFor).valueOf() - dayjs(left.scheduledFor).valueOf()
  );

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent enableDynamicSizing>
        <DrawerCloseButton />

        <DrawerHeader style={styles.header}>
          <DrawerTitle style={styles.title}>{t("reminders:runsDrawer.title")}</DrawerTitle>
          {!!reminder?.title && <Text style={styles.meta}>{reminder.title}</Text>}
        </DrawerHeader>

        {isLoading ? (
          <View style={styles.body}>
            <ActivityIndicator />
          </View>
        ) : ordered.length === 0 ? (
          <View style={styles.body}>
            <Text style={styles.empty}>{t("reminders:runsDrawer.empty")}</Text>
          </View>
        ) : (
          <DrawerScrollView contentContainerStyle={styles.list}>
            {ordered.map((run) => (
              <View key={run.id} style={styles.run}>
                <View style={styles.runText}>
                  <Text style={styles.runDate}>
                    {dayjs(run.scheduledFor).format("MMM D, YYYY HH:mm")}
                  </Text>
                  {!!run.performedAt && (
                    <Text style={styles.runNote}>
                      {t("reminders:runsDrawer.performedAt", {
                        value: dayjs(run.performedAt).format("MMM D, HH:mm"),
                      })}
                    </Text>
                  )}
                  {!!run.note && <Text style={styles.runNote}>{run.note}</Text>}
                </View>
                {!!run.status && (
                  <Chip
                    label={t(`reminders:runsDrawer.status.${run.status}`)}
                    size="sm"
                    tone={RUN_STATUS_TONE[run.status]}
                  />
                )}
              </View>
            ))}
          </DrawerScrollView>
        )}
      </DrawerContent>
    </Drawer>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    gap: theme.spacing(1),
  },
  title: {
    fontSize: theme.fontSize.xl,
    letterSpacing: 0,
  },
  meta: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  body: {
    paddingVertical: theme.spacing(6),
    alignItems: "center",
  },
  empty: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  list: {
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  run: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.surfacePage,
  },
  runText: {
    flex: 1,
    gap: theme.spacing(0.5),
  },
  runDate: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
  runNote: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
}));
