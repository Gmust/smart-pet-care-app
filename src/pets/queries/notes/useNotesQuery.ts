import { useQuery } from "@tanstack/react-query";

import { localNotesStore } from "./localNotesStore";

export const useNotesQuery = (petId: string | undefined) =>
  useQuery({
    enabled: !!petId,
    queryKey: ["pets", petId, "notes"],
    queryFn: async () => localNotesStore.list(petId ?? ""),
  });
