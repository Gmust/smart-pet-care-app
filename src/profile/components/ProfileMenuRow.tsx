import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ChevronRightIcon } from "@/icons/chevron-right";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

type ProfileMenuRowProps = {
  icon: ReactNode;
  label: string;
  description?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  onPress?: () => void;
};

export function ProfileMenuRow({
  icon,
  label,
  description,
  tone = "default",
  disabled = false,
  onPress,
}: ProfileMenuRowProps) {
  const isDanger = tone === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && !disabled && styles.rowPressed]}
    >
      <View style={[styles.iconWrap, isDanger && styles.iconWrapDanger]}>{icon}</View>
      <View style={styles.copy}>
        <Text style={[styles.label, isDanger && styles.labelDanger]}>{label}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>
      <ChevronRightIcon
        width={18}
        height={18}
        color={isDanger ? palette.brand.danger : palette.brand.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(3),
  },
  rowPressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  iconWrap: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  iconWrapDanger: {
    backgroundColor: theme.palette.brand.dangerBg,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(0.5),
  },
  label: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.4,
    color: theme.palette.brand.textPrimary,
  },
  labelDanger: {
    color: theme.palette.brand.danger,
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.fontSize.sm * 1.35,
    color: theme.palette.brand.textSecondary,
  },
}));
