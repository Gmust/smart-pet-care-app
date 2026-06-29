import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteApiUsersId } from "@/api";

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-account"],
    mutationFn: async (id: string) => {
      await deleteApiUsersId(id);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
