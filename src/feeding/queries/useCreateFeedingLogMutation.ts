import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiPetsPetIdFeedingLogs } from "@/api";
import type { CreateFeedingLogDto } from "@/api/generated";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Variables = {
  petId: string;
  dto: CreateFeedingLogDto;
};

export const useCreateFeedingLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, dto }: Variables) => {
      const response = await postApiPetsPetIdFeedingLogs(petId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.logs(petId) });
      // The daily summary and the week chart are derived from the same meals.
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.summary(petId) });
    },
  });
};
