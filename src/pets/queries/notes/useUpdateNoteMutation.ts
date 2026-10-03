import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiPetsPetIdNotesNoteId } from "@/api";
import type { PatchNoteDto } from "@/api/generated";

import { notesQueryKeys } from "./notesQueryKeys";

type Variables = {
  petId: string;
  noteId: string;
  dto: PatchNoteDto;
};

export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, noteId, dto }: Variables) => {
      const response = await patchApiPetsPetIdNotesNoteId(petId, noteId, dto);
      return response.data;
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.notes(petId) });
    },
  });
};
