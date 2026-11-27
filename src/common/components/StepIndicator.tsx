import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type StepIndicatorProps = {
  current: number;
  total: number;
  label: string;
  showLabel?: boolean;
};

const DOT_TRANSITION = LinearTransition.duration(200);

export const StepIndicator = ({ current, total, label, showLabel = false }: StepIndicatorProps) => {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} style={styles.row}>
      {Array.from({ length: total }, (_, index) => (
        <Animated.View
          key={index}
          layout={DOT_TRANSITION}
          style={[styles.dot, index + 1 === current && styles.dotActive]}
        />
      ))}
      {showLabel && (
        <Text variant="caption" style={styles.label}>
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(2),
  },
  dot: {
    width: theme.spacing(1.75),
    height: theme.spacing(1.75),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.textFaint,
  },
  dotActive: {
    width: theme.spacing(4.5),
    backgroundColor: theme.palette.brand.primaryDefault,
  },
  label: {
    color: theme.palette.brand.textSecondary,
  },
}));
