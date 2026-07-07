import { useMutation, useQueryClient } from "@tanstack/react-query";

import { plannedHealthEventsMock } from "../api/mock/plannedHealthEvents.mock";
import type { PlannedHealthEvent } from "../types";
import { careQueryKeys } from "./queryKeys";

type UpdatePlannedHealthEventInput = {
  id: string;
  petId: string;
  patch: Partial<Omit<PlannedHealthEvent, "id" | "petId">>;
};

export function useUpdatePlannedHealthEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-planned-health-event"],
    mutationFn: ({ id, patch }: UpdatePlannedHealthEventInput) =>
      plannedHealthEventsMock.update(id, patch),
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({
        queryKey: careQueryKeys.plannedHealthEvents(variables.petId),
      });
    },
  });
}
