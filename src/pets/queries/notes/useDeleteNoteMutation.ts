import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiPetsPetIdNotesNoteId } from "@/api";

import { notesQueryKeys } from "./notesQueryKeys";

type Variables = {
  petId: string;
  noteId: string;
};

export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ petId, noteId }: Variables) => {
      await deleteApiPetsPetIdNotesNoteId(petId, noteId);
    },
    onSuccess: (_data, { petId }) => {
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.notes(petId) });
    },
  });
};
