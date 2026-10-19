import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import dayjs from "dayjs";

import type { FeedingLogResponseDto } from "@/api/generated";
import { UtensilsIcon } from "@/icons/utensils";
import { Chip } from "@/shadecn/ui/chip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadecn/ui/dropdown-menu";
import { Text } from "@/shadecn/ui/text";

import { FOOD_TYPE_ICONS, PRESS_HIGHLIGHT_DELAY_MS } from "../constants";
import type { FeedingListRow, FeedingSlot } from "../types";
import { toApiNumber } from "../utils/toApiNumber";

type MealRowProps = {
  row: FeedingListRow;
  onEdit: (log: FeedingLogResponseDto) => void;
  onDelete: (log: FeedingLogResponseDto) => void;
  onLogSlot: (slot: FeedingSlot) => void;
};

export const MealRow = ({ row, onEdit, onDelete, onLogSlot }: MealRowProps) => {
  const { t } = useTranslation(["feeding"]);
  const { theme } = useUnistyles();

  const isLogged = row.kind === "log";

  const title = isLogged
    ? (row.log.foodName ?? t("feeding:meals.untitled"))
    : (row.occurrence.title ?? t("feeding:meals.untitled"));

  const time = isLogged ? row.log.fedAt : row.occurrence.scheduledFor;

  const loggedParts: string[] = [];
  if (row.kind === "log") {
    if (row.log.foodType) loggedParts.push(t(`feeding:foodTypes.${row.log.foodType}`));

    const amount = toApiNumber(row.log.portionAmount);
    if (amount !== null && row.log.portionUnit) {
      loggedParts.push(`${amount} ${t(`feeding:portionUnits.${row.log.portionUnit}`)}`);
    }

    const calories = toApiNumber(row.log.approxCalories);
    if (calories !== null) loggedParts.push(t("feeding:meals.calories", { count: calories }));
  }

  const subtitle = isLogged
    ? loggedParts.join(" · ")
    : row.kind === "missed"
      ? t("feeding:meals.missed")
      : t("feeding:meals.scheduled");

  const FoodIcon =
    (isLogged && row.log.foodType && FOOD_TYPE_ICONS[row.log.foodType]) || UtensilsIcon;

  const content = (
    <>
      <View style={[styles.iconBox, !isLogged && styles.iconBoxMuted]}>
        <FoodIcon
          width={theme.iconSize.md}
          height={theme.iconSize.md}
          color={isLogged ? theme.palette.brand.peachDefault : theme.palette.brand.textSecondary}
        />
      </View>

      <View style={styles.texts}>
        <Text variant="bodyS" style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.trailing}>
        <Text variant="bodyS" style={styles.time}>
          {time ? dayjs(time).format("HH:mm") : ""}
        </Text>
        {row.kind === "scheduled" && (
          <Chip size="sm" variant="ghost" tone="neutral" label={t("feeding:meals.upcoming")} />
        )}
        {row.kind === "missed" && (
          <Chip size="sm" variant="ghost" tone="warn" label={t("feeding:meals.missedChip")} />
        )}
      </View>
    </>
  );

  // A slot has nothing to edit or delete yet: tapping it records its meal, a missed one at its own
  // time and an upcoming one now (a meal cannot be in the future).
  if (row.kind !== "log") {
    const { reminderId, scheduledFor } = row.occurrence;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("feeding:meals.logMissed")}
        disabled={!reminderId}
        onPress={() => {
          if (!reminderId) return;
          onLogSlot({
            reminderId,
            fedAt: row.kind === "missed" && scheduledFor ? scheduledFor : new Date().toISOString(),
            title: row.occurrence.title ?? null,
          });
        }}
        unstable_pressDelay={PRESS_HIGHLIGHT_DELAY_MS}
        style={({ pressed }) => [styles.root, pressed && styles.rootPressed]}
      >
        {content}
      </Pressable>
    );
  }

  const { log } = row;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          unstable_pressDelay={PRESS_HIGHLIGHT_DELAY_MS}
          style={({ pressed }) => [styles.root, pressed && styles.rootPressed]}
        >
          {content}
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={-theme.spacing(4)}>
        <DropdownMenuItem onPress={() => onEdit(log)}>
          <Text variant="bodySemiBold" style={styles.menuItemText}>
            {t("feeding:meals.menu.edit")}
          </Text>
        </DropdownMenuItem>
        <DropdownMenuItem onPress={() => onDelete(log)}>
          <Text variant="bodySemiBold" style={[styles.menuItemText, styles.menuItemTextDanger]}>
            {t("feeding:meals.menu.delete")}
          </Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2.5),
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.75),
    minHeight: theme.minTouchTarget,
  },
  rootPressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  iconBox: {
    width: theme.spacing(9),
    height: theme.spacing(9),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.brand.peachTint,
  },
  iconBoxMuted: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(1),
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  subtitle: {
    color: theme.palette.brand.textSecondary,
  },
  trailing: {
    alignItems: "flex-end",
    gap: theme.spacing(2),
  },
  time: {
    color: theme.palette.brand.textSecondary,
  },
  menuItemText: {
    color: theme.palette.brand.textPrimary,
  },
  menuItemTextDanger: {
    color: theme.palette.brand.danger,
  },
}));
