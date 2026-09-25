import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { getApiPetsPetIdWellnessEvaluation } from "@/api";

import { wellnessQueryKeys } from "./wellnessQueryKeys";

export function useWellnessQuery(petId: string | undefined) {
  return useQuery({
    enabled: !!petId,
    queryKey: wellnessQueryKeys.evaluation(petId ?? ""),
    queryFn: async () => {
      try {
        // The server decides freshness: it returns a new evaluation once 3 days
        // have passed and the measurement conditions are met, otherwise the last
        // stored one. Refetching is therefore always safe and cheap.
        const response = await getApiPetsPetIdWellnessEvaluation(petId ?? "");
        return response.data;
      } catch (error) {
        // No score yet is an empty state, not a failure: 404 when none was ever
        // stored, 422 when the measurement conditions are not met. Surfacing
        // either as an error would put an error screen in front of every new pet.
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 404 || status === 422) return null;
        throw error;
      }
    },
    // The score changes at most once per 3 days — a few minutes of staleness is
    // fine and keeps the home carousel from refetching per swipe.
    staleTime: 1000 * 60 * 10,
    // An errored query has no data, so it counts as stale and would refetch on
    // every mount — one call per pet each time the home carousel mounts, which
    // is the worst reaction to a 429. Pull-to-refresh still retries.
    retryOnMount: false,
  });
}
