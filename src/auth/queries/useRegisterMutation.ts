import { useMutation } from "@tanstack/react-query";

import { postApiAuthRegister } from "@/api";
import type { RegisterRequest } from "@/api/generated";

export function useRegisterMutation() {
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: async (data: RegisterRequest) => {
      const response = await postApiAuthRegister(data);
      return response.data;
    },
  });
}
