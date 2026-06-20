import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiReminders } from "@/api";
import type { CreateReminderDto } from "@/api/generated";

export const useCreateRemindersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-reminder"],
    mutationFn: async (payload: CreateReminderDto) => {
      const { data } = await postApiReminders(payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
};
