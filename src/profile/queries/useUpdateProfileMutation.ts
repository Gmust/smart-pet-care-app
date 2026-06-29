import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchApiUsers } from "@/api";
import type { PatchUserDto, UserResponseDto } from "@/api/generated";

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-profile"],
    mutationFn: async (payload: PatchUserDto) => {
      const { data } = await patchApiUsers(payload);
      return data;
    },
    onSuccess: (profile: UserResponseDto) => {
      queryClient.setQueryData(["profile", "me"], profile);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};
