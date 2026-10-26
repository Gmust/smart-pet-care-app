import { useQuery } from "@tanstack/react-query";

import { getApiRemindersOccurrences } from "@/api";

import { reminderQueryKeys } from "./reminderQueryKeys";

type Params = {
  petId: string | undefined;
  from?: string;
  to?: string;
  enabled?: boolean;
};

// The endpoint has no `type` filter (unlike `/reminders/runs`), so callers filter the result.
// `isOverdue` is not reliable yet; the feeding list also compares the slot time with the device
// clock.
export const useGetReminderOccurrences = ({ petId, from, to, enabled = true }: Params) => {
  return useQuery({
    enabled: enabled && !!petId,
    staleTime: 60_000,
    queryKey: reminderQueryKeys.occurrences(petId, from, to),
    queryFn: async () => {
      const response = await getApiRemindersOccurrences({ petId, from, to });
      return response.data;
    },
  });
};
