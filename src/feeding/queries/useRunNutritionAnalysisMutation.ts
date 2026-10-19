import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiPetsPetIdNutritionSummaryAnalysis } from "@/api";
import { getUtcOffsetMinutes } from "@/common/utils/getUtcOffsetMinutes";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Variables = {
  petId: string;
  date?: string;
};

// Failures are left to the caller, which branches on the backend's alias (429/502/503 also carry
// `retryAfterSeconds`).
export const useRunNutritionAnalysisMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, date }: Variables) => {
      const response = await postApiPetsPetIdNutritionSummaryAnalysis(petId, null, {
        ...(date ? { date } : {}),
        utcOffsetMinutes: getUtcOffsetMinutes(),
      });
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.analysis(petId) });
    },
  });
};
