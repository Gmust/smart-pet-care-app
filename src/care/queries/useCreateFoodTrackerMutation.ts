import { useMutation, useQueryClient } from "@tanstack/react-query";

import { foodTrackerMock } from "../api/mock/foodTracker.mock";
import type { FoodTracker } from "../types";
import { careQueryKeys } from "./queryKeys";

export function useCreateFoodTrackerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-food-tracker"],
    mutationFn: (input: Omit<FoodTracker, "id">) => foodTrackerMock.create(input),
    onSuccess: (_created, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.foodTracker(variables.petId) });
    },
  });
}
