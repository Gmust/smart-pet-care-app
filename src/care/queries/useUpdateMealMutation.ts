import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mealsMock } from "../api/mock/meals.mock";
import type { MealRule } from "../types";
import { careQueryKeys } from "./queryKeys";

type UpdateMealInput = {
  id: string;
  petId: string;
  patch: Partial<Omit<MealRule, "id" | "petId">>;
};

export function useUpdateMealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: UpdateMealInput) => mealsMock.update(id, patch),
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.meals(variables.petId) });
    },
  });
}
