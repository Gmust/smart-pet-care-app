import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiPetsPetIdNutritionGoal } from "@/api";

import { feedingQueryKeys } from "./feedingQueryKeys";

export const useDeleteNutritionGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (petId: string) => {
      await deleteApiPetsPetIdNutritionGoal(petId);
    },
    onSuccess: (_data, petId) => {
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.summary(petId) });
    },
  });
};
