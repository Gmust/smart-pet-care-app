import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { Icon } from "@/icons/icons";
import { palette } from "@/styles/palette";

export type FabActionTone = "primary" | "peach" | "neutral";

const toneColors: Record<FabActionTone, { bg: string; fg: string }> = {
  primary: { bg: palette.brand.primaryXsoft, fg: palette.brand.primaryDefault },
  peach: { bg: palette.brand.peachIconBg, fg: palette.brand.peachDefault },
  neutral: { bg: palette.brand.surfaceSunken, fg: palette.brand.textPrimary },
};

type FabMenuItemProps = {
  icon: Icon;
  title: string;
  subtitle: string;
  tone: FabActionTone;
  onPress?: () => void;
};

export function FabMenuItem({
  icon: IconComponent,
  title,
  subtitle,
  tone,
  onPress,
}: FabMenuItemProps) {
  const colors = toneColors[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: colors.bg }]}>
        <IconComponent width={18} height={18} color={colors.fg} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2.5),
    borderRadius: theme.borderRadius.lg,
  },
  pressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  icon: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: {
    flex: 1,
  },
  title: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    marginTop: theme.spacing(0.25),
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
}));
