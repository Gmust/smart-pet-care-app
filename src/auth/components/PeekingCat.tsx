import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Image } from "expo-image";

const peekingCat = require("../../../assets/images/onboarding/peeking-cat.svg");

// Figma's frame for the cat, in spacing units.
const FRAME = { width: 42.5, height: 21.5 };
// Share of Figma's frame that the artwork covers; the SVG's viewBox is cropped to it.
const ARTWORK = { left: 0.0344, top: 0.1203, width: 0.9084, height: 0.8421 };

interface PeekingCatProps {
  style?: StyleProp<ViewStyle>;
}

export const PeekingCat = ({ style }: PeekingCatProps) => {
  return (
    <View pointerEvents="none" style={[styles.frame, style]}>
      <Image source={peekingCat} contentFit="contain" style={styles.artwork} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  frame: {
    width: theme.spacing(FRAME.width),
    height: theme.spacing(FRAME.height),
  },
  artwork: {
    position: "absolute",
    left: theme.spacing(FRAME.width * ARTWORK.left),
    top: theme.spacing(FRAME.height * ARTWORK.top),
    width: theme.spacing(FRAME.width * ARTWORK.width),
    height: theme.spacing(FRAME.height * ARTWORK.height),
  },
}));
