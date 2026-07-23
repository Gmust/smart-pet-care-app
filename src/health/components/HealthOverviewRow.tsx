import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { cardVariants } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

type IconTone = "peach" | "primary";

type HealthOverviewRowProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  tone: IconTone;
  onPress?: () => void;
};

export function HealthOverviewRow({
  title,
  subtitle,
  icon,
  tone,
  onPress,
}: HealthOverviewRowProps) {
  cardVariants.useVariants({ padding: "compact", radius: "standalone" });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [cardVariants.card, styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.iconBg, tone === "peach" ? styles.iconBgPeach : styles.iconBgPrimary]}>
        {icon}
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
  },
  rowPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  iconBg: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
  },
  iconBgPeach: {
    backgroundColor: theme.palette.brand.peachIconBg,
  },
  iconBgPrimary: {
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(0.5),
  },
  title: {
    ...theme.textStyles.body,
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    ...theme.textStyles.bodyS,
    color: theme.palette.brand.textSecondary,
  },
}));
