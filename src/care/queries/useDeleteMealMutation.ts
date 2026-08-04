import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mealsMock } from "../api/mock/meals.mock";

import { careQueryKeys } from "./queryKeys";

type DeleteMealInput = { id: string; petId: string };

export function useDeleteMealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-meal"],
    mutationFn: ({ id }: DeleteMealInput) => mealsMock.remove(id),
    onSuccess: (_void, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.meals(variables.petId) });
    },
  });
}
