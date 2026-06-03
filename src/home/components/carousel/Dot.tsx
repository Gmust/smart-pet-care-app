import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { palette } from "@/styles/palette";

import "@/styles/config";

const DOT_SIZE = 7;
const DOT_ACTIVE_WIDTH = 18;

type DotProps = {
  index: number;
  progress: SharedValue<number>;
};

export function Dot({ index, progress }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];
    return {
      width: interpolate(
        progress.value,
        inputRange,
        [DOT_SIZE, DOT_ACTIVE_WIDTH, DOT_SIZE],
        Extrapolation.CLAMP
      ),
      backgroundColor: interpolateColor(progress.value, inputRange, [
        palette.brand.textFaint,
        palette.brand.primaryDefault,
        palette.brand.textFaint,
      ]),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create(() => ({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
}));
