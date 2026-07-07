import { useMutation, useQueryClient } from "@tanstack/react-query";

import { foodTrackerMock } from "../api/mock/foodTracker.mock";
import type { FoodTracker } from "../types";
import { careQueryKeys } from "./queryKeys";

type UpdateFoodTrackerInput = {
  id: string;
  petId: string;
  patch: Partial<Omit<FoodTracker, "id" | "petId">>;
};

export function useUpdateFoodTrackerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-food-tracker"],
    mutationFn: ({ id, patch }: UpdateFoodTrackerInput) => foodTrackerMock.update(id, patch),
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.foodTracker(variables.petId) });
    },
  });
}
