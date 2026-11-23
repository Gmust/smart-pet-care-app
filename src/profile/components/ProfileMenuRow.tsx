import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { PRESS_HIGHLIGHT_DELAY_MS } from "@/common/constants";
import { ChevronIcon } from "@/icons/chevron";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

type ProfileMenuRowProps = {
  icon: ReactNode;
  label: string;
  description?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  pressDelay?: number;
  onPress?: () => void;
};

export function ProfileMenuRow({
  icon,
  label,
  description,
  tone = "default",
  disabled = false,
  pressDelay = PRESS_HIGHLIGHT_DELAY_MS,
  onPress,
}: ProfileMenuRowProps) {
  const { theme } = useUnistyles();

  const isDanger = tone === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      unstable_pressDelay={pressDelay}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && !disabled && styles.rowPressed]}
    >
      <View style={[styles.iconWrap, isDanger && styles.iconWrapDanger]}>{icon}</View>
      <View style={styles.copy}>
        <Text variant="bodySemiBold" style={[styles.label, isDanger && styles.labelDanger]}>
          {label}
        </Text>
        {!!description && (
          <Text variant="bodyS" style={styles.description}>
            {description}
          </Text>
        )}
      </View>
      <ChevronIcon
        direction="right"
        width={theme.iconSize.lg}
        height={theme.iconSize.lg}
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
    color: theme.palette.brand.textPrimary,
  },
  labelDanger: {
    color: theme.palette.brand.danger,
  },
  description: {
    color: theme.palette.brand.textSecondary,
  },
}));
