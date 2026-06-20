import { useEffect } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type SkeletonBoxProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBox({ width = "100%", height, radius, style }: SkeletonBoxProps) {
  const opacity = useSharedValue(0.42);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.86, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.box,
        { width, height },
        radius !== undefined && { borderRadius: radius },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  box: {
    backgroundColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.lg,
  },
}));
