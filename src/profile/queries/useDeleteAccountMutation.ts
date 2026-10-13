import { useMutation } from "@tanstack/react-query";

import { deleteApiUsersId } from "@/api";

// No cache clear here: the caller signs out next, and signOut clears it.
export const useDeleteAccountMutation = () => {
  return useMutation({
    mutationKey: ["delete-account"],
    mutationFn: async (id: string) => {
      await deleteApiUsersId(id);
    },
  });
};
