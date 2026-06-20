import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiPetsId } from "@/api";

export default () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-pet"],
    mutationFn: async (petId: string) => {
      await deleteApiPetsId(petId);
    },
    onSuccess: (_, petId) => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: ["pets", petId] });
    },
  });
};
