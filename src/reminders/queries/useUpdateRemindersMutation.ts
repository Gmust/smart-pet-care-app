import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiRemindersId } from "@/api";
import type { PatchReminderDto } from "@/api/generated";
import { getUtcOffsetMinutes } from "@/common/utils/getUtcOffsetMinutes";

export const useUpdateRemindersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-reminder"],
    mutationFn: async ({ id, payload }: { id: string; payload: PatchReminderDto }) => {
      const { data } = await patchApiRemindersId(id, {
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
