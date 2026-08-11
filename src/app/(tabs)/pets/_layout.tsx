import { Stack } from "expo-router";

export default function PetsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pet-profile" />
      <Stack.Screen name="health-record-list" />
    </Stack>
  );
}
