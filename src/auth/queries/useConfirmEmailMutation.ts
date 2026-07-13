import { useMutation } from "@tanstack/react-query";

import { postApiAuthConfirmEmail } from "@/api";
import type { ConfirmEmailRequest } from "@/api/generated";

export function useConfirmEmailMutation() {
  return useMutation({
    mutationKey: ["auth", "confirm-email"],
    mutationFn: async (data: ConfirmEmailRequest) => {
      await postApiAuthConfirmEmail(data);
    },
  });
}
