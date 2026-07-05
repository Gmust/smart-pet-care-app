import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { ReminderStatus } from "@/api";
import { hexToRGBA } from "@/common/utils/colors";
import { Chip } from "@/shadecn/ui/chip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadecn/ui/dropdown-menu";
import { Text } from "@/shadecn/ui/text";
import { palette } from "@/styles/palette";

import type { Reminder, ReminderTone } from "../types";

const toneColors: Record<ReminderTone, { bg: string; fg: string }> = {
  primary: { bg: palette.brand.primarySoft, fg: palette.brand.primaryDark },
  peach: { bg: palette.brand.peachSoft, fg: palette.brand.peachDefault },
  warn: { bg: palette.brand.peachSoft, fg: palette.brand.warn },
};

const statusChipProps: Record<
  ReminderStatus,
  { tone: "ok" | "primary" | "danger" | "neutral"; variant?: "ghost" }
> = {
  Completed: { tone: "ok" },
  Active: { tone: "primary" },
  Missed: { tone: "danger" },
  Cancelled: { tone: "neutral", variant: "ghost" },
};

function StatusChip({ status }: { status: ReminderStatus }) {
  const { t } = useTranslation(["home"]);

  return (
    <Chip label={t(`reminders.chipLabels.${status}`)} size="sm" {...statusChipProps[status]} />
  );
}

type ReminderRowProps = {
  reminder: Reminder;
  onEdit?: () => void;
  onChangeStatus?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  muted?: boolean;
};

export function ReminderRow({
  reminder,
  onEdit,
  onChangeStatus,
  onDelete,
  isDeleting = false,
  muted = false,
}: ReminderRowProps) {
  const { t } = useTranslation(["reminders"]);
  const { theme } = useUnistyles();
  const { icon: IconComponent, tone, title, time, status } = reminder;
  const colors = toneColors[tone];
  const isOverdue = status === "Missed";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title}, ${time}`}
          accessibilityState={{ selected: status === "Completed", disabled: isDeleting }}
          disabled={isDeleting}
          style={({ pressed }) => [
            styles.card,
            isOverdue && styles.cardOverdue,
            muted && styles.cardMuted,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.bg }]}>
              <IconComponent width={18} height={18} color={colors.fg} />
            </View>
            <View style={styles.text}>
              <Text style={styles.title}>{title}</Text>
              <Text style={[styles.time, isOverdue && styles.timeOverdue]}>{time}</Text>
            </View>
            <StatusChip status={status} />
          </View>
          {isDeleting && (
            <View style={styles.deletingOverlay}>
              <ActivityIndicator color={theme.palette.brand.primaryDefault} />
            </View>
          )}
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={-20}>
        <DropdownMenuItem onPress={onEdit}>
          <Text style={styles.menuItemText}>{t("reminders:actionsDrawer.edit")}</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={onChangeStatus}>
          <Text style={styles.menuItemText}>{t("reminders:actionsDrawer.changeStatus")}</Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={onDelete}>
          <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
            {t("reminders:actionsDrawer.delete")}
          </Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    padding: theme.spacing(3),
  },
  deletingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: hexToRGBA(theme.palette.white, 0.7),
  },
  cardOverdue: {
    borderColor: theme.palette.brand.danger,
    backgroundColor: theme.palette.brand.dangerBg,
  },
  cardMuted: {
    opacity: 0.55,
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
  timeOverdue: {
    fontFamily: theme.fonts.medium,
    color: theme.palette.brand.danger,
  },
  menuItemText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
  },
  menuItemTextDanger: {
    color: theme.palette.brand.danger,
  },
}));
