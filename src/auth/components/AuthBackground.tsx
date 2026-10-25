import type { ReactNode } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { LinearGradient } from "expo-linear-gradient";

import { HeroSilhouette } from "./HeroSilhouette";

interface AuthBackgroundProps {
  hero?: boolean;
  children: ReactNode;
}

const HERO_OPACITY = 0.11;
const GRADIENT_STOP = 0.75;

export const AuthBackground = ({ hero = false, children }: AuthBackgroundProps) => {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[theme.palette.brand.primaryXsoft, theme.palette.brand.surfacePage]}
      locations={[0, GRADIENT_STOP]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        {hero ? (
          <HeroSilhouette
            size={theme.spacing(41)}
            opacity={HERO_OPACITY}
            style={styles.hero(insets.top)}
          />
        ) : null}
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create((theme) => ({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Absolute offsets ignore the SafeAreaView's padding, so the top inset is added by hand.
  hero: (topInset: number) => ({
    position: "absolute",
    right: theme.spacing(6.75),
    top: topInset + theme.spacing(3.5),
  }),
}));
