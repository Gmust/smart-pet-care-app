import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { DailyNutritionSummaryResponseDto } from "@/api/generated";
import { Card } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import { PRESS_HIGHLIGHT_DELAY_MS } from "../constants";
import { toApiNumber } from "../utils/toApiNumber";

type NutritionTodayCardProps = {
  summary: DailyNutritionSummaryResponseDto;
  onPress: () => void;
};

export const NutritionTodayCard = ({ summary, onPress }: NutritionTodayCardProps) => {
  const { t } = useTranslation(["feeding"]);

  const calories = toApiNumber(summary.totalCalories) ?? 0;
  const mealCount = toApiNumber(summary.mealCount) ?? 0;
  const mealsTarget = toApiNumber(summary.goal?.mealsPerDay);

  // Without calories on any meal the headline counts meals instead of reading "0 kcal".
  const isMealsMetric = calories === 0 && mealCount > 0;
  const total = isMealsMetric ? mealCount : calories;
  const target = isMealsMetric ? mealsTarget : toApiNumber(summary.goal?.dailyCalorieTarget);
  const remaining = toApiNumber(summary.comparison?.caloriesRemaining);

  // Guard a zero target: it would render an Infinity-wide bar.
  const percent = target !== null && target > 0 ? Math.round((total / target) * 100) : null;
  const fillPercent = percent === null ? 0 : Math.min(percent, 100);

  const portion = summary.portionTotalsByUnit?.[0];
  const portionAmount = toApiNumber(portion?.totalAmount);

  return (
    <Card
      radius="loose"
      padding="none"
      style={styles.card}
      pressDelay={PRESS_HIGHLIGHT_DELAY_MS}
      onPress={onPress}
      accessibilityLabel={t("feeding:today.editGoal")}
    >
      <View style={styles.valueRow}>
        <Text variant="display" style={styles.value}>
          {total}
        </Text>
        <Text variant="body" style={styles.target}>
          {isMealsMetric
            ? t(target === null ? "feeding:today.noTargetMeals" : "feeding:today.ofTargetMeals", {
                target,
              })
            : t(target === null ? "feeding:today.noTarget" : "feeding:today.ofTarget", { target })}
        </Text>
        {percent !== null && (
          <Chip size="sm" variant="ghost" tone="neutral" label={`${percent}%`} />
        )}
      </View>

      {target !== null && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${fillPercent}%` }]} />
        </View>
      )}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text variant="bodyS" style={styles.statLabel}>
            {t("feeding:today.meals")}
          </Text>
          <Text variant="bodyS" style={styles.statValue}>
            {mealsTarget === null ? mealCount : `${mealCount} / ${mealsTarget}`}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text variant="bodyS" style={styles.statLabel}>
            {t("feeding:today.portion")}
          </Text>
          <Text variant="bodyS" style={styles.statValue}>
            {portionAmount === null || !portion?.unit
              ? "—"
              : `${portionAmount} ${t(`feeding:portionUnits.${portion.unit}`)}`}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text variant="bodyS" style={styles.statLabel}>
            {t("feeding:today.remaining")}
          </Text>
          <Text variant="bodyS" style={styles.statValue}>
            {remaining === null ? "—" : t("feeding:today.remainingValue", { count: remaining })}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    boxShadow: theme.shadows.card,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing(1),
  },
  value: {
    color: theme.palette.brand.textPrimary,
  },
  target: {
    flex: 1,
    color: theme.palette.brand.textSecondary,
  },
  track: {
    height: theme.spacing(1.5),
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.surfaceSunken,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.peachDefault,
  },
  stats: {
    flexDirection: "row",
    gap: theme.spacing(4),
  },
  stat: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing(1),
  },
  statLabel: {
    color: theme.palette.brand.textSecondary,
  },
  statValue: {
    color: theme.palette.brand.textPrimary,
  },
}));
