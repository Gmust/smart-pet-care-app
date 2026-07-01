import { useQuery } from "@tanstack/react-query";

import { getApiRemindersId } from "@/api";

export function useGetReminderById(id: string | undefined, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryKey: ["reminders", "detail", id],
    queryFn: async () => {
      const response = await getApiRemindersId(id ?? "");
      return response.data;
    },
  });
}
