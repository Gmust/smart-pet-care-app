import { useMutation } from "@tanstack/react-query";

import { postApiAuthResendConfirmation } from "@/api";
import type { ResendConfirmationRequest } from "@/api/generated";

export function useResendConfirmationMutation() {
  return useMutation({
    mutationKey: ["auth", "resend-confirmation"],
    mutationFn: async (data: ResendConfirmationRequest) => {
      await postApiAuthResendConfirmation(data);
    },
  });
}
