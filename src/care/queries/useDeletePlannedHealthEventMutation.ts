import { useMutation, useQueryClient } from "@tanstack/react-query";

import { plannedHealthEventsMock } from "../api/mock/plannedHealthEvents.mock";

import { careQueryKeys } from "./queryKeys";

type DeletePlannedHealthEventInput = { id: string; petId: string };

export function useDeletePlannedHealthEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-planned-health-event"],
    mutationFn: ({ id }: DeletePlannedHealthEventInput) => plannedHealthEventsMock.remove(id),
    onSuccess: (_void, variables) => {
      queryClient.invalidateQueries({
        queryKey: careQueryKeys.plannedHealthEvents(variables.petId),
      });
    },
  });
}
