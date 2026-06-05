import { useAuth } from "@/auth/hooks/useAuth";

import { Redirect } from "expo-router";

export default function Index() {
  const { status } = useAuth();

  // Session is still being restored from secure storage — keep the splash visual
  // (blank) rather than flashing onboarding before redirecting.
  if (status === "loading") {
    return null;
  }

  if (status === "authenticated") {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
