import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

type PetListModeTileProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
};

export const PetListModeTile = ({ label, selected, onPress, children }: PetListModeTileProps) => {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.tile, selected && styles.tileSelected]}
    >
      {children}
      <Text variant="bodySemiBold" style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  tile: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: theme.spacing(2.5),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["3xl"],
    backgroundColor: theme.palette.white,
    padding: theme.spacing(3),
  },
  tileSelected: {
    borderWidth: 1.5,
    borderColor: theme.palette.brand.primaryDefault,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  label: {
    color: theme.palette.brand.textPrimary,
  },
  labelSelected: {
    color: theme.palette.brand.primaryDark,
  },
}));
