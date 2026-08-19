import { useQuery } from "@tanstack/react-query";

import { getApiRemindersIdRuns } from "@/api";

export function useGetReminderRuns(id: string) {
  return useQuery({
    queryKey: ["reminders", "runs", id],
    queryFn: async () => {
      const response = await getApiRemindersIdRuns(id);
      return response.data;
    },
  });
}
