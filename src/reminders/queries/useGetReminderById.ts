import { useQuery } from "@tanstack/react-query";

import { getApiRemindersId } from "@/api";

import { reminderQueryKeys } from "./reminderQueryKeys";

export function useGetReminderById(id: string | undefined, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryKey: reminderQueryKeys.detail(id),
    queryFn: async () => {
      const response = await getApiRemindersId(id ?? "");
      return response.data;
    },
  });
}
