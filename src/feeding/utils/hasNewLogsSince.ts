import dayjs from "dayjs";

import type { FeedingLogResponseDto, NutritionAnalysisResponseDto } from "@/api/generated";

// A meal backdated to another day does not count; neither does a deletion, which the API does not
// timestamp.
export const hasNewLogsSince = (
  logs: FeedingLogResponseDto[],
  analysis: NutritionAnalysisResponseDto
): boolean => {
  const ranAt = dayjs(analysis.createdAt);

  return logs.some((log) => {
    if (!log.fedAt || !dayjs(log.fedAt).isSame(dayjs(analysis.date), "day")) return false;

    const changedAt = dayjs(log.updatedAt ?? log.createdAt);
    return changedAt.isValid() && changedAt.isAfter(ranAt);
  });
};
