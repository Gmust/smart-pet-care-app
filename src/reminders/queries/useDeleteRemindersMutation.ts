import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiRemindersId } from "@/api";

import { reminderQueryKeys } from "./reminderQueryKeys";

export const useDeleteRemindersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-reminder"],
    mutationFn: async (id: string) => {
      await deleteApiRemindersId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.all() });
    },
  });
};
