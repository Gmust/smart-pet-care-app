import { useMutation, useQueryClient } from "@tanstack/react-query";

import { foodTrackerMock } from "../api/mock/foodTracker.mock";

import { careQueryKeys } from "./queryKeys";

type DeleteFoodTrackerInput = { id: string; petId: string };

export function useDeleteFoodTrackerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-food-tracker"],
    mutationFn: ({ id }: DeleteFoodTrackerInput) => foodTrackerMock.remove(id),
    onSuccess: (_void, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.foodTracker(variables.petId) });
    },
  });
}
