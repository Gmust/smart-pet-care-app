import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image } from "expo-image";

const heroSilhouette = require("../../../assets/images/onboarding/hero-silhouette.svg");

// Share of Figma's square frame that the artwork covers; the SVG's viewBox is cropped to it.
const ARTWORK = { left: 0.0273, top: 0.1364, width: 0.9182, height: 0.6773 };

interface HeroSilhouetteProps {
  /** Side of Figma's square frame, in px. */
  size: number;
  opacity: number;
  style?: StyleProp<ViewStyle>;
}

export const HeroSilhouette = ({ size, opacity, style }: HeroSilhouetteProps) => {
  return (
    <View pointerEvents="none" style={[styles.frame(size, opacity), style]}>
      <Image source={heroSilhouette} contentFit="contain" style={styles.artwork(size)} />
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  frame: (size: number, opacity: number) => ({
    width: size,
    height: size,
    opacity,
  }),
  artwork: (size: number) => ({
    position: "absolute",
    left: size * ARTWORK.left,
    top: size * ARTWORK.top,
    width: size * ARTWORK.width,
    height: size * ARTWORK.height,
  }),
}));
