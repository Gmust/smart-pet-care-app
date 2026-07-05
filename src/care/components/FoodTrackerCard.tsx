import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

import type { FoodTracker, WeightUnit } from "../types";
import dayjs from "dayjs";

const GRAMS_PER_KG = 1000;

function toGrams(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value * GRAMS_PER_KG : value;
}

type Props = {
  tracker: FoodTracker;
  onPress?: () => void;
};

export function FoodTrackerCard({ tracker, onPress }: Props) {
  const { t } = useTranslation(["care"]);

  const totalGrams =
    toGrams(tracker.packageWeight, tracker.packageWeightUnit) * tracker.packageCount;
  const remainingGrams =
    tracker.remainingWeight != null && tracker.remainingWeightUnit
      ? toGrams(tracker.remainingWeight, tracker.remainingWeightUnit)
      : totalGrams;
  const percentRemaining =
    totalGrams > 0 ? Math.min(1, Math.max(0, remainingGrams / totalGrams)) : 0;

  const restockLabel = tracker.restockDate
    ? t("foodTracker.restockDate", { date: dayjs(tracker.restockDate).format("MMMM D, YYYY") })
    : t("foodTracker.restockDateUnknown");

  const remainingLabel =
    tracker.remainingWeight != null && tracker.remainingWeightUnit
      ? `${tracker.remainingWeight}/${tracker.packageWeight * tracker.packageCount} ${tracker.remainingWeightUnit}`
      : "—";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tracker.foodName}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.title}>{tracker.foodName}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentRemaining * 100}%` }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{restockLabel}</Text>
        <Text style={styles.footerText}>{remainingLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing(2.5),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    padding: theme.spacing(4),
  },
  cardPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSize.sm,
    color: theme.palette.brand.textPrimary,
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
    backgroundColor: theme.palette.brand.toast,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
}));
