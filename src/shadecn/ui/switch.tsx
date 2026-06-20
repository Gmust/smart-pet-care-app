import { Pressable } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as SwitchPrimitive from "@rn-primitives/switch";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type SwitchSize = "md" | "sm";

type SwitchDimensions = {
  width: number;
  height: number;
  thumb: number;
  padding: number;
};

const SWITCH_SIZES: Record<SwitchSize, SwitchDimensions> = {
  md: { width: 52, height: 32, thumb: 26, padding: 3 },
  sm: { width: 44, height: 26, thumb: 20, padding: 3 },
};

const TIMING = { duration: 180 };

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
};

export function Switch({ checked, onCheckedChange, disabled = false, size = "md" }: SwitchProps) {
  const { theme } = useUnistyles();
  const { width, height, thumb, padding } = SWITCH_SIZES[size];
  const travel = width - thumb - padding * 2;

  const trackOff = theme.palette.brand.surfaceBorder;
  const trackOn = theme.palette.brand.primaryDefault;

  const progress = useDerivedValue(() => withTiming(checked ? 1 : 0, TIMING), [checked]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [trackOff, trackOn]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, travel]) }],
  }));

  return (
    <SwitchPrimitive.Root
      asChild
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    >
      <AnimatedPressable
        style={[
          styles.root,
          { width, height, borderRadius: height / 2, padding },
          disabled && styles.disabled,
          trackStyle,
        ]}
      >
        <SwitchPrimitive.Thumb asChild>
          <Animated.View
            style={[
              styles.thumb,
              { width: thumb, height: thumb, borderRadius: thumb / 2 },
              thumbStyle,
            ]}
          />
        </SwitchPrimitive.Thumb>
      </AnimatedPressable>
    </SwitchPrimitive.Root>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  thumb: {
    backgroundColor: theme.palette.white,
    shadowColor: theme.palette.brand.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
}));
