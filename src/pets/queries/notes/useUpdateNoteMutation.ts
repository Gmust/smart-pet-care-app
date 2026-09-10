import { useMutation, useQueryClient } from "@tanstack/react-query";

import { localNotesStore } from "./localNotesStore";

type UpdateNoteVariables = {
  petId: string;
  noteId: string;
  title: string;
  content: string;
};

export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-note"],
    mutationFn: async ({ petId, noteId, title, content }: UpdateNoteVariables) =>
      localNotesStore.update(petId, noteId, { title, content }),
    onSuccess: (_note, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pets", variables.petId, "notes"] });
    },
  });
};
