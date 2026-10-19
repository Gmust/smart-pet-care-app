import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

export type PetScreenOrigin = "home";

const ORIGIN_HREF = {
  home: "/(tabs)/home",
} as const satisfies Record<PetScreenOrigin, string>;

// Pop the pets stack first, so the screen is not left on top of it for the next visit to Pets, then
// show the origin tab. Returns undefined for a screen opened inside the pets stack, where the
// ordinary back is right.
export const useBackToOrigin = (origin: PetScreenOrigin | undefined) => {
  const router = useRouter();

  const goBack = useCallback(() => {
    if (!origin) return;
    if (router.canGoBack()) router.back();
    router.navigate(ORIGIN_HREF[origin]);
  }, [origin, router]);

  useFocusEffect(
    useCallback(() => {
      if (!origin) return undefined;

      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        goBack();
        return true;
      });
      return () => subscription.remove();
    }, [origin, goBack])
  );

  return origin ? goBack : undefined;
};
