import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mealsMock } from "../api/mock/meals.mock";
import type { MealRule } from "../types";

import { careQueryKeys } from "./queryKeys";

export function useCreateMealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-meal"],
    mutationFn: (input: Omit<MealRule, "id">) => mealsMock.create(input),
    onSuccess: (_created, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.meals(variables.petId) });
    },
  });
}
