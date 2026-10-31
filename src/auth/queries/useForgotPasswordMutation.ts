import { useMutation } from "@tanstack/react-query";

import { postApiAuthForgotPassword } from "@/api";
import type { ForgotPasswordRequest } from "@/api/generated";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationKey: ["auth", "forgot-password"],
    mutationFn: async (data: ForgotPasswordRequest) => {
      await postApiAuthForgotPassword(data);
    },
  });
}
