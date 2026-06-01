import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { Reminder, ReminderStatus, ReminderTone } from "../types";

const { brand } = palette;

const toneColors: Record<ReminderTone, { bg: string; fg: string }> = {
  primary: { bg: brand.primarySoft, fg: brand.primaryDark },
  peach: { bg: brand.peachSoft, fg: brand.peachDefault },
  warn: { bg: brand.peachSoft, fg: brand.warn },
};

function StatusChip({ status }: { status: ReminderStatus }) {
  switch (status) {
    case "done":
      return <Chip label="Done" tone="ok" size="sm" />;
    case "next":
      return <Chip label="Next up" tone="primary" size="sm" />;
    case "pending":
    default:
      return <Chip label="Pending" tone="neutral" variant="ghost" size="sm" />;
  }
}

type ReminderRowProps = {
  reminder: Reminder;
};

export function ReminderRow({ reminder }: ReminderRowProps) {
  const { icon: IconComponent, tone, title, time, status } = reminder;
  const colors = toneColors[tone];

  return (
    <View style={styles.card}>
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
    </View>
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
