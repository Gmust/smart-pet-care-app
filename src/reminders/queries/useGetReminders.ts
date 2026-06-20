import { useQuery } from "@tanstack/react-query";

import { getApiReminders } from "@/api";
import type { GetApiRemindersParams } from "@/api/generated";

export function useGetReminders(params?: GetApiRemindersParams, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ["reminders", params],
    queryFn: async () => {
      const response = await getApiReminders(params);
      return response.data;
    },
  });
}
