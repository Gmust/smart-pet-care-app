import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { NutritionAnalysisResponseDto } from "@/api/generated";
import { ChevronIcon } from "@/icons/chevron";
import { Button } from "@/shadecn/ui/button";
import { Card } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import { ANALYSIS_STATUS_TONE, NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS } from "../constants";
import { describeAnalysis } from "../utils/describeAnalysis";

type AnalysisCardProps = {
  analysis: NutritionAnalysisResponseDto;
  isGoal: boolean;
  canRun: boolean;
  isRunning: boolean;
  onPress: () => void;
  onRun: () => void;
};

export const AnalysisCard = ({
  analysis,
  isGoal,
  canRun,
  isRunning,
  onPress,
  onRun,
}: AnalysisCardProps) => {
  const { t } = useTranslation(["feeding"]);
  const { theme } = useUnistyles();

  const { actual, target, deviationLabel, mealCount, dateLabel } = describeAnalysis(analysis);

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("feeding:analysis.open")}
        onPress={onPress}
        unstable_pressDelay={NAVIGATION_PRESS_HIGHLIGHT_DELAY_MS}
        style={({ pressed }) => [styles.overlay, pressed && styles.overlayPressed]}
      />

      <View pointerEvents="none" style={styles.content}>
        <View style={styles.status}>
          {!!analysis.status && (
            <Chip
              size="sm"
              variant="default"
              tone={ANALYSIS_STATUS_TONE[analysis.status]}
              label={t(`feeding:analysis.status.${analysis.status}`)}
            />
          )}
          <View style={styles.spacer} />
          <ChevronIcon
            direction="right"
            width={theme.iconSize.lg}
            height={theme.iconSize.lg}
            color={theme.palette.brand.textSecondary}
          />
        </View>

        <View style={styles.numbers}>
          <Text variant="bodySemiBold" style={styles.actual}>
            {actual}
          </Text>
          <Text variant="bodyS" style={styles.goalLine}>
            {t(isGoal ? "feeding:analysis.ofGoal" : "feeding:analysis.ofTarget", {
              target,
              deviation: deviationLabel,
            })}
          </Text>
        </View>

        <Text variant="bodyS" style={styles.meta}>
          {t("feeding:analysis.meta", {
            date: dateLabel,
            count: mealCount,
          })}
        </Text>
        <Text variant="caption" style={styles.disclaimer}>
          {t("feeding:analysis.disclaimerShort")}
        </Text>
      </View>

      <View style={styles.action}>
        <Button
          variant="text"
          size="inline"
          disabled={!canRun}
          isLoading={isRunning}
          onPress={onRun}
        >
          {t("feeding:analysis.run")}
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow: theme.shadows.card,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlayPressed: {
    backgroundColor: theme.palette.brand.surfacePage,
  },
  content: {
    gap: theme.spacing(2),
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  spacer: {
    flex: 1,
  },
  numbers: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing(1),
  },
  actual: {
    color: theme.palette.brand.textPrimary,
  },
  goalLine: {
    flex: 1,
    color: theme.palette.brand.textSecondary,
  },
  meta: {
    color: theme.palette.brand.textSecondary,
  },
  disclaimer: {
    color: theme.palette.brand.textFaint,
  },
  action: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
}));
