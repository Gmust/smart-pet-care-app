import { useQuery } from "@tanstack/react-query";

import { getApiRemindersPetPetId } from "@/api";

export function useGetRemindersByPet(petId: string | undefined, enabled = true) {
  return useQuery({
    enabled: enabled && !!petId,
    queryKey: ["reminders", "pet", petId],
    queryFn: async () => {
      const response = await getApiRemindersPetPetId(petId ?? "");
      return response.data;
    },
  });
}
