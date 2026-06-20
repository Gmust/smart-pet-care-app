import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type RoundButtonProps = {
  accessibilityLabel: string;
  children: ReactNode;
  onPress?: () => void;
};

export function RoundButton({ accessibilityLabel, children, onPress }: RoundButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.roundButton, pressed && styles.roundButtonPressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  roundButton: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.white,
  },
  roundButtonPressed: {
    opacity: 0.82,
  },
}));
