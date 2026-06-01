import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type IconButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function IconButton({ children, onPress, accessibilityLabel }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.white,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
  },
  buttonPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
}));
