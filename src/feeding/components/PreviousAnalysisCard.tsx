import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { NutritionAnalysisResponseDto } from "@/api/generated";
import { Card } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import { ANALYSIS_STATUS_TONE } from "../constants";
import { describeAnalysis } from "../utils/describeAnalysis";

type PreviousAnalysisCardProps = {
  analysis: NutritionAnalysisResponseDto;
  isGoal: boolean;
};

export const PreviousAnalysisCard = ({ analysis, isGoal }: PreviousAnalysisCardProps) => {
  const { t } = useTranslation(["feeding"]);

  const { actual, target, deviationLabel, mealCount, dateLabel } = describeAnalysis(analysis);

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      {!!analysis.status && (
        <Chip
          size="sm"
          variant="default"
          tone={ANALYSIS_STATUS_TONE[analysis.status]}
          label={t(`feeding:analysis.status.${analysis.status}`)}
        />
      )}
      <View style={styles.numbers}>
        <Text variant="bodySemiBold" style={styles.actual}>
          {actual}
        </Text>
        <Text variant="bodyS" style={styles.secondary}>
          {t(isGoal ? "feeding:analysis.ofGoal" : "feeding:analysis.ofTarget", {
            target,
            deviation: deviationLabel,
          })}
        </Text>
      </View>
      <Text variant="bodyS" style={styles.secondary}>
        {t("feeding:analysis.meta", { date: dateLabel, count: mealCount })}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow: theme.shadows.card,
  },
  numbers: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing(1),
  },
  actual: {
    color: theme.palette.brand.textPrimary,
  },
  secondary: {
    flex: 1,
    color: theme.palette.brand.textSecondary,
  },
}));
