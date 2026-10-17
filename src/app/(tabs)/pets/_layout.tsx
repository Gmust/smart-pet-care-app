import { Stack } from "expo-router";
import { z } from "zod";

// Pets screens opened from another tab (Home) are pushed with the list under them.
export const unstable_settings = { anchor: "index" };

const originParamSchema = z.object({ from: z.string().optional() });

// A slide would show the pets list (dark cards) through a screen opened from Home, so those screens
// appear without it.
const animationForOrigin = ({ route }: { route: { params?: object } }) => ({
  animation: originParamSchema.safeParse(route.params).data?.from
    ? ("none" as const)
    : ("default" as const),
});

export default function PetsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pet-profile" options={animationForOrigin} />
      <Stack.Screen name="health-record-list" />
      <Stack.Screen name="note" />
      <Stack.Screen name="assessment" options={animationForOrigin} />
      <Stack.Screen name="feeding-log" />
      <Stack.Screen name="nutrition-analysis" />
      <Stack.Screen name="weight-history" />
    </Stack>
  );
}
