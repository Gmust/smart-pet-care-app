import { useQuery } from "@tanstack/react-query";

import { getApiReminders } from "@/api";
import type { GetApiRemindersParams } from "@/api/generated";

import { reminderQueryKeys } from "./reminderQueryKeys";

export function useGetReminders(params?: GetApiRemindersParams, enabled = true) {
  return useQuery({
    enabled,
    staleTime: 60_000,
    queryKey: reminderQueryKeys.list(params),
    queryFn: async () => {
      const response = await getApiReminders(params);
      return response.data;
    },
  });
}
