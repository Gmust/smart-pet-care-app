import { useQueries } from "@tanstack/react-query";
import dayjs from "dayjs";

import { getApiPetsPetIdNutritionSummary } from "@/api";
import { getUtcOffsetMinutes } from "@/common/utils/getUtcOffsetMinutes";

import { QUERY_STALE_TIME_MS, WEEK_LENGTH_DAYS } from "../constants";
import { buildWeekSummary } from "../utils/buildWeekSummary";

import { feedingQueryKeys } from "./feedingQueryKeys";

// One daily summary per day (there is no range endpoint), so the totals match the Today card
// exactly.
export const useWeekNutritionQueries = (petId: string | undefined) => {
  const days = Array.from({ length: WEEK_LENGTH_DAYS }, (_, index) =>
    dayjs()
      .subtract(WEEK_LENGTH_DAYS - 1 - index, "day")
      .format("YYYY-MM-DD")
  );

  return useQueries({
    queries: days.map((date) => ({
      enabled: !!petId,
      staleTime: QUERY_STALE_TIME_MS,
      queryKey: feedingQueryKeys.summaryForDate(petId ?? "", date),
      queryFn: async () => {
        const response = await getApiPetsPetIdNutritionSummary(petId ?? "", {
          date,
          utcOffsetMinutes: getUtcOffsetMinutes(),
        });
        return response.data;
      },
    })),
    combine: (results) => ({
      week: buildWeekSummary(
        results.map((result, index) => ({ date: days[index] ?? "", summary: result.data }))
      ),
      // Loading, not pending: offline with nothing cached is pending forever.
      isLoading: results.every((result) => result.isLoading),
    }),
  });
};
