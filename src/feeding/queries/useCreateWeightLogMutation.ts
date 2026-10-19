import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiPetsPetIdWeightHistory } from "@/api";
import type { CreatePetWeightLogDto } from "@/api/generated";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Variables = {
  petId: string;
  dto: CreatePetWeightLogDto;
};

export const useCreateWeightLogMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, dto }: Variables) => {
      const response = await postApiPetsPetIdWeightHistory(petId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: feedingQueryKeys.weight(petId) });
      // The pet list and profile render a current weight of their own.
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
};
