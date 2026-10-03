import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiPetsPetIdNotes } from "@/api";
import type { CreateNoteDto } from "@/api/generated";

import { notesQueryKeys } from "./notesQueryKeys";

type Variables = {
  petId: string;
  dto: CreateNoteDto;
};

export const useCreateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, dto }: Variables) => {
      const response = await postApiPetsPetIdNotes(petId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.notes(petId) });
    },
  });
};
