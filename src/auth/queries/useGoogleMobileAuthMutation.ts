import { useMutation } from "@tanstack/react-query";

import { postApiAuthOauthGoogleMobile } from "@/api";
import type { GoogleMobileRequest } from "@/api/generated";

export function useGoogleMobileAuthMutation() {
  return useMutation({
    mutationKey: ["auth", "google-mobile"],
    mutationFn: async (data: GoogleMobileRequest) => {
      const response = await postApiAuthOauthGoogleMobile(data);
      return response.data;
    },
  });
}
