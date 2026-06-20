import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiPetsId } from "@/api";
import type { UpdatePetDto } from "@/api/generated";

type UpdatePetVariables = {
  id: string;
  payload: UpdatePetDto;
};

export const useUpdatePetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-pet"],
    mutationFn: async ({ id, payload }: UpdatePetVariables) => {
      const { data } = await patchApiPetsId(id, payload);
      return data;
    },
    onSuccess: (pet, variables) => {
      queryClient.setQueryData(["pets", variables.id], pet);
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["pets", variables.id] });
    },
  });
};
