import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import { DeleteConfirmDialog } from "@/common/components/DeleteConfirmDialog";
import { SectionHeader } from "@/common/components/SectionHeader";

import { WEIGHT_WINDOW_DAYS } from "../constants";
import { useFeedingLogDelete } from "../hooks/useFeedingLogDelete";
import { useFeedingOccurrences } from "../hooks/useFeedingOccurrences";
import { useMealDrawers } from "../hooks/useMealDrawers";
import { useNutritionGoalDelete } from "../hooks/useNutritionGoalDelete";
import { useFeedingLogsQuery } from "../queries/useFeedingLogsQuery";
import { useNutritionSummaryQuery } from "../queries/useNutritionSummaryQuery";
import { useWeekNutritionQueries } from "../queries/useWeekNutritionQueries";
import { useWeightHistoryQuery } from "../queries/useWeightHistoryQuery";
import { MealsListSkeleton } from "../skeletons/MealsListSkeleton";
import { TodayCardSkeleton } from "../skeletons/TodayCardSkeleton";
import { WeekBarsSkeleton } from "../skeletons/WeekBarsSkeleton";
import { WeightCardSkeleton } from "../skeletons/WeightCardSkeleton";
import { buildFeedingRows } from "../utils/buildFeedingRows";
import { toApiNumber } from "../utils/toApiNumber";
import { toWeightPoints } from "../utils/toWeightPoints";

import { DailyGoalDrawer } from "./drawers/DailyGoalDrawer";
import { LogWeightDrawer } from "./drawers/LogWeightDrawer";
import { EmptyCard } from "./EmptyCard";
import { FeedingScheduleBlock } from "./FeedingScheduleBlock";
import { MealDrawers } from "./MealDrawers";
import { MealsListCard } from "./MealsListCard";
import { NutritionAnalysisBlock } from "./NutritionAnalysisBlock";
import { NutritionTodayCard } from "./NutritionTodayCard";
import { WeekBarsCard } from "./WeekBarsCard";
import { WeightCard } from "./WeightCard";

type FeedingTabContentProps = {
  petId: string;
  onSeeAllMeals: () => void;
  onOpenAnalysis: () => void;
  onOpenSchedule: () => void;
  onOpenWeightHistory: () => void;
};

export const FeedingTabContent = ({
  petId,
  onSeeAllMeals,
  onOpenAnalysis,
  onOpenSchedule,
  onOpenWeightHistory,
}: FeedingTabContentProps) => {
  const { t } = useTranslation(["feeding", "common"]);

  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const mealDrawers = useMealDrawers();
  const { requestDelete, dialogProps } = useFeedingLogDelete(petId);
  const { requestDelete: requestGoalDelete, dialogProps: goalDialogProps } =
    useNutritionGoalDelete(petId);

  const {
    data: summary,
    isPending: isSummaryPending,
    isError: isSummaryError,
    fetchStatus: summaryFetchStatus,
    refetch: refetchSummary,
  } = useNutritionSummaryQuery({ petId });
  const {
    data: logs,
    isPending: isLogsPending,
    isError: isLogsError,
    fetchStatus: logsFetchStatus,
    refetch: refetchLogs,
  } = useFeedingLogsQuery(petId);
  const { data: occurrences } = useFeedingOccurrences(petId);
  const { week, isLoading: isWeekLoading } = useWeekNutritionQueries(petId);
  const {
    data: weightLogs,
    isPending: isWeightPending,
    isError: isWeightError,
    fetchStatus: weightFetchStatus,
    refetch: refetchWeight,
  } = useWeightHistoryQuery({
    petId,
    from: dayjs().subtract(WEIGHT_WINDOW_DAYS, "day").startOf("day").toISOString(),
    to: dayjs().endOf("day").toISOString(),
  });

  const rows = useMemo(() => buildFeedingRows(logs, occurrences), [logs, occurrences]);

  const todayRows = useMemo(
    () =>
      rows.filter((row) => {
        const iso = row.kind === "log" ? row.log.fedAt : row.occurrence.scheduledFor;
        return !!iso && dayjs(iso).isSame(dayjs(), "day");
      }),
    [rows]
  );

  // A summary exists even without a goal or meals; the card appears once there is a goal or
  // something logged.
  const todaySummary =
    summary && (!!summary.goal || (toApiNumber(summary.mealCount) ?? 0) > 0) ? summary : undefined;

  // Empty must mean nothing is there, never failed or loading; a paused query is offline with no
  // data, so it counts as failed.
  const isSummaryFailed = !summary && (isSummaryError || summaryFetchStatus === "paused");
  const isLogsFailed = !logs && (isLogsError || logsFetchStatus === "paused");
  const isSummaryEmpty = !todaySummary && !isSummaryFailed && !isSummaryPending;
  const isSummaryLoading = isSummaryPending && !isSummaryFailed;
  const isLogsLoading = isLogsPending && !isLogsFailed;
  const isMealsEmpty = todayRows.length === 0 && !isLogsFailed && !isLogsPending;

  const weightPoints = useMemo(() => toWeightPoints(weightLogs), [weightLogs]);
  const isWeightFailed = !weightLogs && (isWeightError || weightFetchStatus === "paused");
  const isWeightEmpty = weightPoints.length === 0 && !isWeightFailed && !isWeightPending;
  const isWeightLoading = isWeightPending && !isWeightFailed;

  const hasWeekData = week.bars.some((bar) => bar.value > 0);

  return (
    <View style={styles.root}>
      <View style={styles.block}>
        {/* The goal comes with the summary: a form opened earlier is blank and would clear it. */}
        <SectionHeader
          label={t("feeding:today.label")}
          action={summary ? t("feeding:today.editGoal") : undefined}
          onActionPress={() => setIsGoalOpen(true)}
        />
        {isSummaryLoading && <TodayCardSkeleton />}
        {todaySummary && (
          <NutritionTodayCard summary={todaySummary} onPress={() => setIsGoalOpen(true)} />
        )}
        {isSummaryFailed && (
          <EmptyCard
            message={t("feeding:error.today")}
            actionLabel={t("common:errors.tryAgain")}
            onActionPress={() => refetchSummary()}
          />
        )}
        {isSummaryEmpty && (
          <EmptyCard
            message={t("feeding:empty.today.message")}
            actionLabel={t("feeding:empty.today.action")}
            onActionPress={() => setIsGoalOpen(true)}
          />
        )}
      </View>

      <View style={styles.block}>
        <SectionHeader
          label={t("feeding:meals.label")}
          action={t("feeding:meals.seeAll")}
          onActionPress={onSeeAllMeals}
        />
        {isLogsLoading && <MealsListSkeleton />}
        {todayRows.length > 0 && (
          <MealsListCard
            rows={todayRows}
            onEdit={mealDrawers.editLog}
            onLogSlot={mealDrawers.logSlot}
            onDelete={(log) => {
              if (!log.id) return;
              requestDelete({ id: log.id, title: log.foodName ?? t("feeding:meals.untitled") });
            }}
          />
        )}
        {isLogsFailed && (
          <EmptyCard
            message={t("feeding:error.meals")}
            actionLabel={t("common:errors.tryAgain")}
            onActionPress={() => refetchLogs()}
          />
        )}
        {isMealsEmpty && (
          <EmptyCard
            message={t("feeding:empty.meals.message")}
            actionLabel={t("feeding:empty.meals.action")}
            onActionPress={mealDrawers.openCreate}
          />
        )}
      </View>

      {(hasWeekData || isWeekLoading) && (
        <View style={styles.block}>
          <SectionHeader label={t("feeding:week.label")} />
          {isWeekLoading ? <WeekBarsSkeleton /> : <WeekBarsCard week={week} />}
        </View>
      )}

      <NutritionAnalysisBlock
        petId={petId}
        onOpenAnalysis={onOpenAnalysis}
        onLogMeal={mealDrawers.openCreate}
      />

      <View style={styles.block}>
        <SectionHeader label={t("feeding:weight.label")} />
        {isWeightLoading && <WeightCardSkeleton />}
        {weightPoints.length > 0 && (
          <WeightCard points={weightPoints} onHistoryPress={onOpenWeightHistory} />
        )}
        {isWeightFailed && (
          <EmptyCard
            message={t("feeding:error.weight")}
            actionLabel={t("common:errors.tryAgain")}
            onActionPress={() => refetchWeight()}
          />
        )}
        {isWeightEmpty && (
          <EmptyCard
            message={t("feeding:empty.weight.message")}
            actionLabel={t("feeding:empty.weight.action")}
            onActionPress={() => setIsLogWeightOpen(true)}
          />
        )}
      </View>

      <FeedingScheduleBlock petId={petId} onOpenSchedule={onOpenSchedule} />

      <DeleteConfirmDialog {...dialogProps} />
      <DeleteConfirmDialog {...goalDialogProps} />
      <DailyGoalDrawer
        isOpen={isGoalOpen && !!summary}
        setIsOpen={setIsGoalOpen}
        petId={petId}
        goal={summary?.goal}
        onRemove={() => {
          setIsGoalOpen(false);
          requestGoalDelete();
        }}
      />
      <LogWeightDrawer isOpen={isLogWeightOpen} setIsOpen={setIsLogWeightOpen} petId={petId} />
      <MealDrawers petId={petId} {...mealDrawers.drawerProps} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing(4),
  },
  block: {
    gap: theme.spacing(2),
  },
}));
