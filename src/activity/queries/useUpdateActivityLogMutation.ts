import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiPetsPetIdActivityLogsActivityLogId } from "@/api";
import type { PatchActivityLogDto } from "@/api/generated";

import { activityQueryKeys } from "./activityQueryKeys";

type Variables = {
  petId: string;
  activityLogId: string;
  dto: PatchActivityLogDto;
};

export function useUpdateActivityLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, activityLogId, dto }: Variables) => {
      const response = await patchApiPetsPetIdActivityLogsActivityLogId(petId, activityLogId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.logs(petId) });
    },
  });
}
