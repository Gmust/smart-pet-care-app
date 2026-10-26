import { useQuery } from "@tanstack/react-query";

import { getApiRemindersPetPetId } from "@/api";

import { reminderQueryKeys } from "./reminderQueryKeys";

export function useGetRemindersByPet(petId: string | undefined, enabled = true) {
  return useQuery({
    enabled: enabled && !!petId,
    staleTime: 60_000,
    queryKey: reminderQueryKeys.byPet(petId),
    queryFn: async () => {
      const response = await getApiRemindersPetPetId(petId ?? "");
      return response.data;
    },
  });
}
