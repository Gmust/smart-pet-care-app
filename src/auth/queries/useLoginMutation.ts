import { useMutation } from "@tanstack/react-query";

import { postApiAuthLogin } from "@/api";
import type { LoginRequest } from "@/api/generated";

export function useLoginMutation() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (data: LoginRequest) => {
      const response = await postApiAuthLogin(data);
      return response.data;
    },
  });
}
