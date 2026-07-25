import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiPetsPetIdHealthRecords } from "@/api";
import type { CreateHealthRecordDto } from "@/api/generated";

type Variables = {
  petId: string;
  dto: CreateHealthRecordDto;
};

export function useCreateHealthRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, dto }: Variables) => {
      const response = await postApiPetsPetIdHealthRecords(petId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: ["health", "records", petId] });
    },
  });
}
