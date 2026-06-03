import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import "@/styles/config";
import type { Reminder, ReminderStatus, ReminderTone } from "../types";

const toneColors: Record<ReminderTone, { bg: string; fg: string }> = {
  primary: { bg: palette.brand.primarySoft, fg: palette.brand.primaryDark },
  peach: { bg: palette.brand.peachSoft, fg: palette.brand.peachDefault },
  warn: { bg: palette.brand.peachSoft, fg: palette.brand.warn },
};

function StatusChip({ status }: { status: ReminderStatus }) {
  const { t } = useTranslation(["home"]);

  switch (status) {
    case "done":
      return <Chip label={t("reminders.chipLabels.done")} tone="ok" size="sm" />;
    case "next":
      return <Chip label={t("reminders.chipLabels.next")} tone="primary" size="sm" />;
    case "pending":
    default:
      return (
        <Chip label={t("reminders.chipLabels.pending")} tone="neutral" variant="ghost" size="sm" />
      );
  }
}

type ReminderRowProps = {
  reminder: Reminder;
  onPress?: () => void;
};

export function ReminderRow({ reminder, onPress }: ReminderRowProps) {
  const { icon: IconComponent, tone, title, time, status } = reminder;
  const colors = toneColors[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${time}`}
      accessibilityState={{ selected: status === "done" }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.bg }]}>
          <IconComponent width={18} height={18} color={colors.fg} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <StatusChip status={status} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    padding: theme.spacing(3),
  },
  cardPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(3),
  },
  icon: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
  time: {
    marginTop: theme.spacing(0.5),
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
}));
