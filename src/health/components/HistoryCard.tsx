import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS } from "@/common/constants";
import { cardVariants } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

type HistoryCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  variant?: "default" | "overdue";
  onPress?: () => void;
};

export function HistoryCard({
  title,
  subtitle,
  icon,
  variant = "default",
  onPress,
}: HistoryCardProps) {
  cardVariants.useVariants({ padding: "none", radius: "loose" });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      unstable_pressDelay={NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS}
      style={({ pressed }) => [cardVariants.card, styles.card, pressed && cardVariants.pressed]}
    >
      <View style={styles.iconBg}>{icon}</View>
      <Text variant="titleM" style={styles.title}>
        {title}
      </Text>
      <Text
        variant="bodyS"
        style={[styles.subtitle, variant === "overdue" && styles.subtitleOverdue]}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 0,
    alignItems: "center",
    gap: theme.spacing(1),
    paddingHorizontal: theme.spacing(2.5),
    paddingVertical: theme.spacing(3.5),
  },
  iconBg: {
    width: theme.spacing(13.75),
    height: theme.spacing(13.75),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.peachIconBg,
  },
  title: {
    color: theme.palette.brand.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
    textAlign: "center",
  },
  subtitleOverdue: {
    color: theme.palette.brand.warn,
    textAlign: "center",
  },
}));
