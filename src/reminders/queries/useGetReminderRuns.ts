import { useQuery } from "@tanstack/react-query";

import { getApiRemindersIdRuns } from "@/api";

import { reminderQueryKeys } from "./reminderQueryKeys";

export function useGetReminderRuns(id: string) {
  return useQuery({
    queryKey: reminderQueryKeys.runs(id),
    queryFn: async () => {
      const response = await getApiRemindersIdRuns(id);
      return response.data;
    },
  });
}
