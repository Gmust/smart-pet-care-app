import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiRemindersIdComplete } from "@/api";
import { healthQueryKeys } from "@/health/queries/healthQueryKeys";

export const useCompleteReminderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["complete-reminder"],
    mutationFn: async (id: string) => {
      const { data } = await postApiRemindersIdComplete(id, null);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: healthQueryKeys.allRecords() });
    },
  });
};
