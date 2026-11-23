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
      <Text variant="bodySemiBold" style={styles.urgency}>
        ⚕ {t("assessment.urgency", { urgency: urgencyLabel })}
      </Text>
      <Text variant="bodySemiBold" style={styles.section}>
        {t("assessment.nextSteps")}
      </Text>
      {prediction.homeAdvice.map((advice) => (
        <Text key={advice} variant="bodyS" style={styles.advice}>
          • {advice}
        </Text>
      ))}
      <Text variant="bodySemiBold" style={styles.possibleCondition}>
        {t("assessment.possibleCondition", { condition: prediction.predictedCondition })}
      </Text>
      <Text variant="caption" style={styles.possibleConditionNote}>
        {t("assessment.possibleConditionNote")}
      </Text>
      <Text variant="bodyS" style={styles.meta}>
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
  section: { marginTop: theme.spacing(2) },
  urgency: { color: theme.palette.brand.primaryDark },
  advice: { color: theme.palette.brand.textBody },
  possibleCondition: { marginTop: theme.spacing(2) },
  possibleConditionNote: { color: theme.palette.brand.textSecondary },
  meta: { color: theme.palette.brand.textBody },
}));
