import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiPetsPetIdWeightHistoryWeightLogId } from "@/api";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Variables = {
  petId: string;
  weightLogId: string;
};

export const useDeleteWeightLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, weightLogId }: Variables) => {
      await deleteApiPetsPetIdWeightHistoryWeightLogId(petId, weightLogId);
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.weight(petId) });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
};
