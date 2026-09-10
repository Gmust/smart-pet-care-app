import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiPetsPetIdActivityLogsActivityLogId } from "@/api";

import { activityQueryKeys } from "./activityQueryKeys";

type Variables = {
  petId: string;
  activityLogId: string;
};

export function useDeleteActivityLogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, activityLogId }: Variables) => {
      await deleteApiPetsPetIdActivityLogsActivityLogId(petId, activityLogId);
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.logs(petId) });
    },
  });
}
