import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiPets } from "@/api";
import type { CreatePetDto } from "@/api/generated";

export const useCreatePetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-pet"],
    mutationFn: async (payload: CreatePetDto) => {
      const { data } = await postApiPets(payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
    },
  });
};
