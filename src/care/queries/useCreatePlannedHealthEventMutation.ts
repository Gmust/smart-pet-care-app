import { useMutation, useQueryClient } from "@tanstack/react-query";

import { plannedHealthEventsMock } from "../api/mock/plannedHealthEvents.mock";
import type { PlannedHealthEvent } from "../types";

import { careQueryKeys } from "./queryKeys";

export function useCreatePlannedHealthEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-planned-health-event"],
    mutationFn: (input: Omit<PlannedHealthEvent, "id">) => plannedHealthEventsMock.create(input),
    onSuccess: (_created, variables) => {
      queryClient.invalidateQueries({
        queryKey: careQueryKeys.plannedHealthEvents(variables.petId),
      });
    },
  });
}
