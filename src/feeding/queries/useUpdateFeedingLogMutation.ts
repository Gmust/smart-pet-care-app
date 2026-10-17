import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiPetsPetIdFeedingLogsLogId } from "@/api";
import type { PatchFeedingLogDto } from "@/api/generated";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Variables = {
  petId: string;
  logId: string;
  dto: PatchFeedingLogDto;
};

export const useUpdateFeedingLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, logId, dto }: Variables) => {
      const response = await patchApiPetsPetIdFeedingLogsLogId(petId, logId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.logs(petId) });
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.summary(petId) });
    },
  });
};
