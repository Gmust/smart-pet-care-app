import { useCallback } from "react";
import { useRouter } from "expo-router";

import type { AuthResponse } from "@/api/generated";

import { useAuth } from "./useAuth";

export const useCompleteAuth = () => {
  const router = useRouter();
  const { signIn } = useAuth();

  return useCallback(
    async (response: AuthResponse) => {
      await signIn(response);
      router.replace("/(tabs)/home");
    },
    [signIn, router]
  );
};
