import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import "@/styles/config";
import type { QuickActionItem } from "../types";

type QuickActionProps = {
  item: QuickActionItem;
  onPress?: () => void;
};

export function QuickAction({ item, onPress }: QuickActionProps) {
  const { icon: IconComponent, label } = item;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <IconComponent width={16} height={16} color={palette.brand.primaryDefault} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flexBasis: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    paddingVertical: theme.spacing(3),
    paddingHorizontal: theme.spacing(3.5),
  },
  pressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  icon: {
    width: theme.spacing(7.5),
    height: theme.spacing(7.5),
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primarySoft,
  },
  label: {
    flex: 1,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
}));
