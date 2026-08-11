import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiPetsPetIdHealthRecordsRecordId } from "@/api";
import type { PatchHealthRecordDto } from "@/api/generated";

import { healthQueryKeys } from "./healthQueryKeys";

type Variables = {
  petId: string;
  recordId: string;
  dto: PatchHealthRecordDto;
};

export function useUpdateHealthRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, recordId, dto }: Variables) => {
      const response = await patchApiPetsPetIdHealthRecordsRecordId(petId, recordId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: healthQueryKeys.records(petId) });
    },
  });
}
