import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiPetsPetIdWeightHistoryWeightLogId } from "@/api";
import type { PatchPetWeightLogDto } from "@/api/generated";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Variables = {
  petId: string;
  weightLogId: string;
  dto: PatchPetWeightLogDto;
};

export const useUpdateWeightLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, weightLogId, dto }: Variables) => {
      const response = await patchApiPetsPetIdWeightHistoryWeightLogId(petId, weightLogId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.weight(petId) });
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
};
