import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdFeedingLogs } from "@/api";

import { QUERY_STALE_TIME_MS } from "../constants";

import { feedingQueryKeys } from "./feedingQueryKeys";

// `GET /feeding-logs` takes no date range, so the full list is fetched and callers narrow it
// client-side.
export const useFeedingLogsQuery = (petId: string | undefined) => {
  return useQuery({
    enabled: !!petId,
    staleTime: QUERY_STALE_TIME_MS,
    queryKey: feedingQueryKeys.logs(petId ?? ""),
    queryFn: async () => {
      const response = await getApiPetsPetIdFeedingLogs(petId ?? "");
      return response.data;
    },
  });
};
