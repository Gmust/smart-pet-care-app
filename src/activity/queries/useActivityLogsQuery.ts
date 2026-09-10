import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdActivityLogs } from "@/api";

import { activityQueryKeys } from "./activityQueryKeys";

type Params = {
  petId: string | undefined;
  from?: string;
  to?: string;
};

/**
 * Activity is classified as volatile by the data-freshness spec, so this
 * overrides the app's 1-hour default stale time.
 */
const ACTIVITY_STALE_TIME_MS = 60_000;

export function useActivityLogsQuery({ petId, from, to }: Params) {
  return useQuery({
    enabled: !!petId,
    staleTime: ACTIVITY_STALE_TIME_MS,
    queryKey: activityQueryKeys.logsInRange(petId ?? "", from, to),
    queryFn: async () => {
      const response = await getApiPetsPetIdActivityLogs(petId ?? "", { from, to });
      return response.data;
    },
  });
}
