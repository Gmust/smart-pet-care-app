import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { palette } from "@/styles/palette";

import { LinearGradient } from "expo-linear-gradient";

export function NavigationBarScrim() {
  const insets = useSafeAreaInsets();

  if (insets.bottom === 0) {
    return null;
  }

  return (
    <LinearGradient
      pointerEvents="none"
      colors={["transparent", palette.brand.surfacePage]}
      locations={[0, 1]}
      style={[styles.scrim, { height: insets.bottom * 1.2 }]}
    />
  );
}

const styles = StyleSheet.create(() => ({
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
}));
