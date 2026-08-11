import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiPetsPetIdHealthRecordsRecordId } from "@/api";

import { healthQueryKeys } from "./healthQueryKeys";

type Variables = {
  petId: string;
  recordId: string;
};

export function useDeleteHealthRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, recordId }: Variables) => {
      await deleteApiPetsPetIdHealthRecordsRecordId(petId, recordId);
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: healthQueryKeys.records(petId) });
    },
  });
}
