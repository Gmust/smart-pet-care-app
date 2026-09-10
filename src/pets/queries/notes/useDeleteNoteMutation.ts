import { useMutation, useQueryClient } from "@tanstack/react-query";

import { localNotesStore } from "./localNotesStore";

type DeleteNoteVariables = {
  petId: string;
  noteId: string;
};

export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-note"],
    mutationFn: async ({ petId, noteId }: DeleteNoteVariables) => {
      localNotesStore.remove(petId, noteId);
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pets", variables.petId, "notes"] });
    },
  });
};
