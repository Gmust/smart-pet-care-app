import { useMutation, useQueryClient } from "@tanstack/react-query";

import { putApiPetsPetIdNutritionGoal } from "@/api";
import type { UpsertNutritionGoalDto } from "@/api/generated";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Variables = {
  petId: string;
  dto: UpsertNutritionGoalDto;
};

// PUT, not PATCH: a pet may have no goal yet, the form submits every target, and
// `PatchFieldOfPortionUnit` cannot carry `null`.
export const useUpsertNutritionGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, dto }: Variables) => {
      const response = await putApiPetsPetIdNutritionGoal(petId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      // Every summary embeds the goal and the remaining-vs-target comparison.
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.summary(petId) });
    },
  });
};
