import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiPetsPetIdActivityLogs } from "@/api";
import type { CreateActivityLogDto } from "@/api/generated";

import { activityQueryKeys } from "./activityQueryKeys";

type Variables = {
  petId: string;
  dto: CreateActivityLogDto;
};

export function useCreateActivityLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, dto }: Variables) => {
      const response = await postApiPetsPetIdActivityLogs(petId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      // logs(petId) is a prefix of logsInRange(petId, …), so this invalidates
      // every cached date range for the pet.
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.logs(petId) });
    },
  });
}
