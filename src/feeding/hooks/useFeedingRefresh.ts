import { useQueryClient } from "@tanstack/react-query";

import { useRefreshControl } from "@/common/hooks/useRefreshControl";
import { reminderQueryKeys } from "@/reminders/queries/reminderQueryKeys";

import { feedingQueryKeys } from "../queries/feedingQueryKeys";

// Schedule slots live under the reminders keys, so they are refetched together with the feeding
// data.
export const useFeedingRefresh = () => {
  const queryClient = useQueryClient();

  return useRefreshControl(() =>
    Promise.all([
      queryClient.refetchQueries({ queryKey: feedingQueryKeys.all(), type: "active" }),
      queryClient.refetchQueries({ queryKey: reminderQueryKeys.all(), type: "active" }),
    ])
  );
};
