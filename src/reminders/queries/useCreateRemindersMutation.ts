import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiReminders } from "@/api";
import type { CreateReminderDto } from "@/api/generated";
import { getUtcOffsetMinutes } from "@/common/utils/getUtcOffsetMinutes";

type CreateReminderInput = Omit<CreateReminderDto, "utcOffsetMinutes">;

export const useCreateRemindersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-reminder"],
    mutationFn: async (payload: CreateReminderInput) => {
      const { data } = await postApiReminders({
        ...payload,
        utcOffsetMinutes: getUtcOffsetMinutes(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
};
