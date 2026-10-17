import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import type { FeedingLogResponseDto } from "@/api/generated";
import { Text } from "@/shadecn/ui/text";

import type { FeedingDaySection, FeedingSlot } from "../types";
import { toApiNumber } from "../utils/toApiNumber";

import { MealsListCard } from "./MealsListCard";

type FeedingDayBlockProps = {
  section: FeedingDaySection;
  onEdit: (log: FeedingLogResponseDto) => void;
  onDelete: (log: FeedingLogResponseDto) => void;
  onLogSlot: (slot: FeedingSlot) => void;
};

export const FeedingDayBlock = ({ section, onEdit, onDelete, onLogSlot }: FeedingDayBlockProps) => {
  const { t } = useTranslation(["feeding"]);

  const day = dayjs(section.dayIso);
  const dayLabel = day.isSame(dayjs(), "day")
    ? t("feeding:logList.today")
    : day.isSame(dayjs().subtract(1, "day"), "day")
      ? t("feeding:logList.yesterday")
      : day.format("MMM D, YYYY");

  const loggedMeals = section.rows.flatMap((row) => (row.kind === "log" ? [row.log] : []));
  const calories = loggedMeals.reduce(
    (sum, log) => sum + (toApiNumber(log.approxCalories) ?? 0),
    0
  );

  const total =
    calories > 0
      ? t("feeding:logList.dayCalories", { count: calories })
      : loggedMeals.length > 0
        ? t("feeding:logList.dayMeals", { count: loggedMeals.length })
        : null;

  return (
    <View style={styles.block}>
      <Text variant="label" style={styles.header}>
        {total ? `${dayLabel} · ${total}` : dayLabel}
      </Text>
      <MealsListCard
        rows={section.rows}
        onEdit={onEdit}
        onDelete={onDelete}
        onLogSlot={onLogSlot}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  block: {
    gap: theme.spacing(2),
  },
  header: {
    textTransform: "uppercase",
    color: theme.palette.brand.textSecondary,
  },
}));
