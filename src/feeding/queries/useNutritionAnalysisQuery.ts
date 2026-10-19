import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdNutritionSummaryAnalysis } from "@/api";

import { feedingQueryKeys } from "./feedingQueryKeys";

export const useNutritionAnalysisQuery = (petId: string | undefined) => {
  return useQuery({
    enabled: !!petId,
    queryKey: feedingQueryKeys.analysis(petId ?? ""),
    queryFn: async () => {
      const response = await getApiPetsPetIdNutritionSummaryAnalysis(petId ?? "");
      return response.data;
    },
  });
};
