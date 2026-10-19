import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ReminderStatus, ReminderType } from "@/api/generated";
import { SectionHeader } from "@/common/components/SectionHeader";
import { useGetRemindersByPet } from "@/reminders/queries/useGetReminderByPet";

import { ScheduleCardSkeleton } from "../skeletons/ScheduleCardSkeleton";

import { EmptyCard } from "./EmptyCard";
import { ScheduleCard } from "./ScheduleCard";

type FeedingScheduleBlockProps = {
  petId: string;
  onOpenSchedule: () => void;
};

export const FeedingScheduleBlock = ({ petId, onOpenSchedule }: FeedingScheduleBlockProps) => {
  const { t } = useTranslation(["feeding", "common"]);

  const { data: reminders, isPending, isError, fetchStatus, refetch } = useGetRemindersByPet(petId);

  const mealsPerDay = (reminders ?? []).filter(
    (reminder) =>
      reminder.type === ReminderType.Feeding && reminder.status === ReminderStatus.Active
  ).length;

  const isFailed = !reminders && (isError || fetchStatus === "paused");
  const isEmpty = !!reminders && mealsPerDay === 0;
  const isLoading = isPending && !isFailed;

  return (
    <View style={styles.block}>
      <SectionHeader label={t("feeding:schedule.label")} />
      {isLoading && <ScheduleCardSkeleton />}
      {mealsPerDay > 0 && <ScheduleCard mealsPerDay={mealsPerDay} onPress={onOpenSchedule} />}
      {isFailed && (
        <EmptyCard
          message={t("feeding:error.schedule")}
          actionLabel={t("common:errors.tryAgain")}
          onActionPress={() => refetch()}
        />
      )}
      {isEmpty && !isPending && (
        <EmptyCard
          message={t("feeding:empty.schedule.message")}
          actionLabel={t("feeding:empty.schedule.action")}
          onActionPress={onOpenSchedule}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  block: {
    gap: theme.spacing(2),
  },
}));
