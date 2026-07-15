import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Text } from "@/shadecn/ui/text";

import type { AssistantChatResponse } from "../../schemas/assistant.schema";

export function PredictionCard({
  prediction,
  deemphasized,
}: {
  prediction: NonNullable<AssistantChatResponse["prediction"]>;
  deemphasized: boolean;
}) {
  const { t } = useTranslation(["assistant"]);
  const urgencyLabel = t(`urgency.${prediction.urgency}`);
  const specialistLabel = t(`specialist.${prediction.specialist}`, {
    defaultValue: t("specialist.generic"),
  });
  const categoryLabel = t(`diseaseCategory.${prediction.diseaseCategory}`, {
    defaultValue: t("diseaseCategory.generic"),
  });
  return (
    <View style={[styles.predictionCard, deemphasized && styles.predictionCardDeemphasized]}>
      <Text style={styles.urgency}>⚕ {t("assessment.urgency", { urgency: urgencyLabel })}</Text>
      <Text style={styles.section}>{t("assessment.nextSteps")}</Text>
      {prediction.homeAdvice.map((advice) => (
        <Text key={advice}>• {advice}</Text>
      ))}
      <Text style={styles.possibleCondition}>
        {t("assessment.possibleCondition", { condition: prediction.predictedCondition })}
      </Text>
      <Text style={styles.possibleConditionNote}>{t("assessment.possibleConditionNote")}</Text>
      <Text style={styles.meta}>
        {specialistLabel} · {categoryLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  predictionCard: {
    gap: theme.spacing(1.5),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.xl,
    borderCurve: "continuous",
    padding: theme.spacing(3.5),
    backgroundColor: theme.palette.white,
  },
  predictionCardDeemphasized: { opacity: 0.6 },
  section: { fontFamily: theme.fonts.bold, marginTop: theme.spacing(2) },
  urgency: { fontFamily: theme.fonts.bold, color: theme.palette.brand.primaryDark },
  possibleCondition: { fontFamily: theme.fonts.semiBold, marginTop: theme.spacing(2) },
  possibleConditionNote: {
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.45,
    color: theme.palette.brand.textSecondary,
  },
  meta: { fontSize: theme.fontSize.sm, color: theme.palette.brand.textBody },
}));
