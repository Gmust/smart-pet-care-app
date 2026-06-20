import type { ReactNode } from "react";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

type SlideProps = {
  animationValue: SharedValue<number>;
  children: ReactNode;
};

export function PetCarouselSlide({ animationValue, children }: SlideProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(animationValue.value, [-1, 0, 1], [0.9, 1, 0.9], Extrapolation.CLAMP),
      },
    ],
    opacity: interpolate(animationValue.value, [-1, 0, 1], [0.6, 1, 0.6], Extrapolation.CLAMP),
  }));

  return <Animated.View style={[styles.slide, animatedStyle]}>{children}</Animated.View>;
}

const styles = StyleSheet.create((theme) => ({
  slide: {
    flex: 1,
    paddingHorizontal: theme.spacing(5),
  },
}));
