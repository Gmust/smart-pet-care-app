import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdNutritionSummary } from "@/api";
import { getUtcOffsetMinutes } from "@/common/utils/getUtcOffsetMinutes";

import { QUERY_STALE_TIME_MS } from "../constants";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Params = {
  petId: string | undefined;
  date?: string;
  enabled?: boolean;
};

// The server does the bucketing, so it needs the device's UTC offset: without it a late-evening
// meal lands on the wrong day.
export const useNutritionSummaryQuery = ({ petId, date, enabled = true }: Params) => {
  return useQuery({
    enabled: enabled && !!petId,
    staleTime: QUERY_STALE_TIME_MS,
    queryKey: feedingQueryKeys.summaryForDate(petId ?? "", date ?? ""),
    queryFn: async () => {
      const response = await getApiPetsPetIdNutritionSummary(petId ?? "", {
        ...(date ? { date } : {}),
        utcOffsetMinutes: getUtcOffsetMinutes(),
      });
      return response.data;
    },
  });
};
