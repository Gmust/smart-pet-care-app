import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiRemindersId } from "@/api";
import type { PatchReminderDto } from "@/api/generated";
import { getUtcOffsetMinutes } from "@/common/utils/getUtcOffsetMinutes";

import { reminderQueryKeys } from "./reminderQueryKeys";

export const useUpdateRemindersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-reminder"],
    mutationFn: async ({ id, payload }: { id: string; payload: PatchReminderDto }) => {
      const hasScheduleFields =
        payload.time !== undefined ||
        payload.days !== undefined ||
        payload.repeatType !== undefined ||
        payload.date !== undefined ||
        payload.endAt !== undefined;

      const { data } = await patchApiRemindersId(id, {
        ...payload,
        ...(hasScheduleFields ? { utcOffsetMinutes: getUtcOffsetMinutes() } : {}),
      });
      return data;
    },
    onSuccess: (reminder, { id }) => {
      // The edit form hydrates once, from whatever the detail cache holds on open. The refetch
      // below may not have landed by then, which left the form on the pre-save values.
      queryClient.setQueryData(reminderQueryKeys.detail(id), reminder);
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.all() });
    },
  });
};
