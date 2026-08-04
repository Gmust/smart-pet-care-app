import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import dayjs from "dayjs";

import { cardVariants } from "@/shadecn/ui/card";
import { Text } from "@/shadecn/ui/text";

import type { FoodTracker } from "../types";
import { formatWeight, toGrams } from "../utils/weight";

import { SwipeToDeleteRow } from "./SwipeToDeleteRow";

type Props = {
  tracker: FoodTracker;
  onPress?: () => void;
  onDelete?: () => void;
};

export const FoodTrackerCard = ({ tracker, onPress, onDelete }: Props) => {
  const { t } = useTranslation(["care"]);
  cardVariants.useVariants({ padding: "standalone", radius: "standalone" });

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

  const displayUnit = tracker.packageWeightUnit;
  const remainingLabel = `${formatWeight(remainingGrams, displayUnit)}/${formatWeight(
    totalGrams,
    displayUnit
  )} ${displayUnit}`;

  return (
    <SwipeToDeleteRow
      disabled={!onDelete}
      onDelete={() => onDelete?.()}
      isFirst
      isLast
      actionVariant="circle"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tracker.foodName}
        onPress={onPress}
        style={({ pressed }) => [cardVariants.card, styles.card, pressed && styles.cardPressed]}
      >
        <Text variant="body" style={styles.title}>
          {tracker.foodName}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percentRemaining * 100}%` }]} />
        </View>
        <View style={styles.footer}>
          <Text variant="bodyS" style={styles.footerText}>
            {restockLabel}
          </Text>
          <Text variant="bodyS" style={styles.footerText}>
            {remainingLabel}
          </Text>
        </View>
      </Pressable>
    </SwipeToDeleteRow>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    gap: theme.spacing(2.5),
  },
  cardPressed: {
    backgroundColor: theme.palette.brand.surfaceSunken,
  },
  title: {
    color: theme.palette.brand.textPrimary,
  },
  track: {
    height: theme.spacing(2.5),
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
    color: theme.palette.brand.textSecondary,
  },
}));
