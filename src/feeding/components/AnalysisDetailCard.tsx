import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { NutritionAnalysisResponseDto } from "@/api/generated";
import { Card } from "@/shadecn/ui/card";
import { Chip } from "@/shadecn/ui/chip";
import { Text } from "@/shadecn/ui/text";

import { ANALYSIS_STATUS_TONE } from "../constants";
import { describeAnalysis } from "../utils/describeAnalysis";

type AnalysisDetailCardProps = {
  analysis: NutritionAnalysisResponseDto;
  isGoal: boolean;
};

export const AnalysisDetailCard = ({ analysis, isGoal }: AnalysisDetailCardProps) => {
  const { t } = useTranslation(["feeding"]);

  const { actual, target, deviationLabel, mealCount, dateLabel } = describeAnalysis(analysis);

  return (
    <Card radius="loose" padding="none" style={styles.card}>
      <View style={styles.summary}>
        <View style={styles.status}>
          {!!analysis.status && (
            <Chip
              size="sm"
              variant="default"
              tone={ANALYSIS_STATUS_TONE[analysis.status]}
              label={t(`feeding:analysis.status.${analysis.status}`)}
            />
          )}
          <Text variant="bodyS" style={styles.period}>
            {dateLabel}
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text variant="bodyS" style={styles.statLabel}>
              {t("feeding:analysis.actual")}
            </Text>
            <Text variant="bodyS" style={styles.statValue}>
              {t("feeding:analysis.perDay", { count: actual })}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="bodyS" style={styles.statLabel}>
              {t("feeding:analysis.target")}
            </Text>
            <Text variant="bodyS" style={styles.statValue}>
              {t("feeding:analysis.perDay", { count: target })}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="bodyS" style={styles.statLabel}>
              {t("feeding:analysis.deviation")}
            </Text>
            <Text variant="bodyS" style={styles.statValue}>
              {deviationLabel}
            </Text>
          </View>
        </View>

        <Text variant="bodyS" style={styles.statLabel}>
          {t(isGoal ? "feeding:analysis.mealsGoal" : "feeding:analysis.mealsTarget", {
            count: mealCount,
          })}
        </Text>
      </View>

      <View style={styles.disclaimer}>
        <Text variant="caption" style={styles.disclaimerText}>
          {analysis.disclaimer || t("feeding:analysis.disclaimerFull")}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    boxShadow: theme.shadows.card,
  },
  summary: {
    gap: theme.spacing(3),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(3),
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  period: {
    flex: 1,
    textAlign: "right",
    color: theme.palette.brand.textSecondary,
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
  disclaimer: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
  },
  disclaimerText: {
    color: theme.palette.brand.textFaint,
  },
}));
