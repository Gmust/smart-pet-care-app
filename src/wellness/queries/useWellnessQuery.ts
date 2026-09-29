import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdWellnessEvaluation } from "@/api";
import { getApiError } from "@/errors/utils/getApiError";

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
        // No score yet is an empty state, not a failure: a pet without enough
        // logged data answers 422 wellness_insufficient_data (a brand-new pet
        // included). Anything else, pet_not_found among it, is a real error.
        if (getApiError(error).code === "wellness_insufficient_data") return null;
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
