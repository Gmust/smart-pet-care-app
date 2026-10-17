import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiRemindersIdComplete } from "@/api";
import type { CompleteReminderDto } from "@/api/generated";
import { healthQueryKeys } from "@/health/queries/healthQueryKeys";

type Variables = {
  id: string;
  // Omitted means "performed now". Pass `performedAt` for a missed slot recorded after the fact, or
  // the run is stamped with the current time.
  dto?: CompleteReminderDto;
};

export const useCompleteReminderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["complete-reminder"],
    mutationFn: async ({ id, dto }: Variables) => {
      const { data } = await postApiRemindersIdComplete(id, dto ?? null);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: healthQueryKeys.allRecords() });
    },
  });
};
