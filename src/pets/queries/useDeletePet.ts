import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiPetsId } from "@/api";

export const useDeletePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-pet"],
    mutationFn: async (petId: string) => {
      await deleteApiPetsId(petId);
    },
    // The server deletes the pet's reminders, meals, activities, records and notes with it, and
    // those are cached under other features' keys with a one-hour staleTime: refresh them all.
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
