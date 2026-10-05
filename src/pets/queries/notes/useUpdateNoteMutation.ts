import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiPetsPetIdNotesNoteId } from "@/api";
import type { NoteResponseDto, PatchNoteDto } from "@/api/generated";

import { decodeNoteField } from "./noteFieldSentinel";
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
    onSuccess: (data, { petId, noteId }) => {
      const decoded = {
        ...data,
        title: decodeNoteField(data.title),
        content: decodeNoteField(data.content),
      };
      // Written synchronously so a reopen right after this save, or a refetch
      // landing while the editor is open, sees the saved value rather than the
      // stale pre-edit one — see SingleNoteEditor's isDirty comparison.
      queryClient.setQueryData<NoteResponseDto[]>(notesQueryKeys.notes(petId), (notes) =>
        notes?.map((note) => (note.id === noteId ? decoded : note))
      );
      queryClient.invalidateQueries({ queryKey: notesQueryKeys.notes(petId) });
    },
  });
};
