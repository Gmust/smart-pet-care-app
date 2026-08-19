import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiRemindersRunsRunIdAcknowledge } from "@/api";

export const useAcknowledgeReminderRunMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["acknowledge-reminder-run"],
    mutationFn: async ({ runId }: { runId: string; reminderId: string }) => {
      const { data } = await postApiRemindersRunsRunIdAcknowledge(runId);
      return data;
    },
    onSuccess: (_data, { reminderId }) => {
      queryClient.invalidateQueries({ queryKey: ["reminders", "runs", reminderId] });
    },
  });
};
