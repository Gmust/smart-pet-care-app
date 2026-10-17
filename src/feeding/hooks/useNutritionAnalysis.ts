import dayjs from "dayjs";

import { getApiError } from "@/errors/utils/getApiError";
import { getApiErrorMessage } from "@/errors/utils/getApiErrorMessage";

import { useFeedingLogsQuery } from "../queries/useFeedingLogsQuery";
import { useNutritionAnalysisQuery } from "../queries/useNutritionAnalysisQuery";
import { useNutritionSummaryQuery } from "../queries/useNutritionSummaryQuery";
import { useRunNutritionAnalysisMutation } from "../queries/useRunNutritionAnalysisMutation";
import { hasNewLogsSince } from "../utils/hasNewLogsSince";
import { toApiNumber } from "../utils/toApiNumber";

export type AnalysisBlocker = "noMeals" | "noCalories";

export const useNutritionAnalysis = (petId: string | undefined) => {
  const {
    data: history,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useNutritionAnalysisQuery(petId);
  const { data: logs } = useFeedingLogsQuery(petId);
  const { data: summary } = useNutritionSummaryQuery({ petId });
  const {
    mutate: runAnalysis,
    isPending: isRunning,
    error: runError,
  } = useRunNutritionAnalysisMutation();

  const latest = history?.latest ?? null;

  // A partial sum of calories reads as "under target", so every meal today needs them (a stored 0
  // counts). Unloaded meals leave the choice to the user.
  const todayLogs = logs?.filter((log) => !!log.fedAt && dayjs(log.fedAt).isSame(dayjs(), "day"));
  const blocker: AnalysisBlocker | null = !todayLogs
    ? null
    : todayLogs.length === 0
      ? "noMeals"
      : todayLogs.every((log) => toApiNumber(log.approxCalories) !== null)
        ? null
        : "noCalories";

  // A repeat is pointless until the analysed day has a meal the verdict has not seen.
  const isLatestToday = !!latest && dayjs(latest.date).isSame(dayjs(), "day");
  // A goal set or changed since the run makes the verdict stale too.
  const goalChangedAt = summary?.goal?.updatedAt ?? summary?.goal?.createdAt;
  const isGoalChanged =
    !!latest && !!goalChangedAt && dayjs(goalChangedAt).isAfter(latest.createdAt);
  const canRun =
    !blocker &&
    (!latest || !isLatestToday || !logs || hasNewLogsSince(logs, latest) || isGoalChanged);

  const failure = runError ? getApiError(runError) : null;

  return {
    latest,
    previous: history?.previous ?? null,
    // A summary that did not load says nothing about the goal either way.
    isEstimate: !!summary && !summary.goal,
    canRun,
    blocker,
    isRunning,
    run: () => {
      if (petId) runAnalysis({ petId });
    },
    runFailure: failure && runError ? { ...failure, message: getApiErrorMessage(runError) } : null,
    isPending,
    isFailed: !history && (isError || fetchStatus === "paused"),
    refetch,
  };
};
