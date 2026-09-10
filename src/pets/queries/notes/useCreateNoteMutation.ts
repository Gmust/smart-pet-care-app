import { useMutation, useQueryClient } from "@tanstack/react-query";

import { localNotesStore } from "./localNotesStore";

type CreateNoteVariables = {
  petId: string;
  title: string;
  content: string;
};

export const useCreateNoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-note"],
    mutationFn: async ({ petId, title, content }: CreateNoteVariables) =>
      localNotesStore.create(petId, { title, content }),
    onSuccess: (_note, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pets", variables.petId, "notes"] });
    },
  });
};
