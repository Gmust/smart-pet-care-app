import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdNotes } from "@/api";

import { decodeNoteField } from "./noteFieldSentinel";
import { notesQueryKeys } from "./notesQueryKeys";

export const useNotesQuery = (petId: string | undefined) =>
  useQuery({
    enabled: !!petId,
    queryKey: notesQueryKeys.notes(petId ?? ""),
    queryFn: async () => {
      const response = await getApiPetsPetIdNotes(petId ?? "");
      return response.data.map((note) => ({
        ...note,
        title: decodeNoteField(note.title),
        content: decodeNoteField(note.content),
      }));
    },
  });
