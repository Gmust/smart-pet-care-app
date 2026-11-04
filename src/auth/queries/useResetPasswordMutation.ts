import { useMutation } from "@tanstack/react-query";

import { postApiAuthResetPassword } from "@/api";
import type { ResetPasswordRequest } from "@/api/generated";

export function useResetPasswordMutation() {
  return useMutation({
    mutationKey: ["auth", "reset-password"],
    mutationFn: async (data: ResetPasswordRequest) => {
      await postApiAuthResetPassword(data);
    },
  });
}
