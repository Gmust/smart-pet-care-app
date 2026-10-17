import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiPetsPetIdFeedingLogsLogId } from "@/api";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Variables = {
  petId: string;
  logId: string;
};

export const useDeleteFeedingLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, logId }: Variables) => {
      await deleteApiPetsPetIdFeedingLogsLogId(petId, logId);
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.logs(petId) });
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.summary(petId) });
    },
  });
};
