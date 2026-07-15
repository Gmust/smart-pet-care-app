import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { SessionMessageResponseDto } from "@/api/generated";
import { ClassifierUrgency } from "@/api/generated";
import { AiIcon } from "@/icons/ai-icon";
import { Text } from "@/shadecn/ui/text";

export function ChatResponseView({
  response,
  localEmergency = false,
}: {
  response: SessionMessageResponseDto;
  localEmergency?: boolean;
}) {
  const { t } = useTranslation(["assistant"]);

  const emergency =
    localEmergency ||
    response.urgentContactEmergencyVet === true ||
    response.urgency === ClassifierUrgency.EMERGENCY;

  const urgencyBorder =
    response.urgency === ClassifierUrgency.MONITOR
      ? styles.monitorBorder
      : response.urgency === ClassifierUrgency.CONSULT_SOON
        ? styles.consultSoonBorder
        : response.urgency === ClassifierUrgency.URGENT
          ? styles.urgentBorder
          : response.urgency === ClassifierUrgency.EMERGENCY
            ? styles.emergencyBorder
            : null;

  if (emergency)
    return (
      <View
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        style={styles.emergency}
      >
        <Text accessibilityRole="header" style={styles.title}>
          ⚠ {t("emergency.title")}
        </Text>
        {localEmergency && response.urgency !== ClassifierUrgency.EMERGENCY && (
          <Text style={styles.emergencyText}>{t("emergency.body")}</Text>
        )}
        <Text selectable style={styles.emergencyText}>
          {response.answer}
        </Text>
        {(response.homeAdvice ?? []).map((advice) => (
          <Text key={advice} style={styles.emergencyText}>
            • {advice}
          </Text>
        ))}
        <Text style={styles.emergencyDisclaimer}>{response.disclaimer}</Text>
        {/* TODO: Restore the emergency-vet finder when its destination is finalized. */}
      </View>
    );

  return (
    <View style={styles.assistantRow} accessibilityLabel={t("conversation.assistantSender")}>
      <View style={styles.assistantAvatar}>
        <AiIcon width={15} height={15} color={styles.assistantAvatarIcon.color} />
      </View>
      <View
        testID="assistant-response-card"
        style={[
          styles.assessment,
          response.urgency ? styles.urgencyAssessment : null,
          urgencyBorder,
        ]}
      >
        <Text selectable style={styles.answerText}>
          {response.answer}
        </Text>
        {response.urgency && (
          <Text accessibilityLiveRegion="polite" style={styles.urgency}>
            ⚕ {t("assessment.urgency", { urgency: t(`urgency.${response.urgency}`) })}
          </Text>
        )}
        {(response.homeAdvice ?? []).map((advice) => (
          <Text key={advice} style={styles.advice}>
            • {advice}
          </Text>
        ))}
        <Text style={styles.disclaimer}>{response.disclaimer}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  title: {
    fontFamily: theme.fonts.display,
    fontSize: theme.fontSize.xl,
    lineHeight: theme.fontSize.xl * 1.3,
    color: theme.palette.brand.textPrimary,
  },
  assistantRow: {
    maxWidth: "94%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing(2),
  },
  assistantAvatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.palette.brand.primaryXsoft,
  },
  assistantAvatarIcon: { color: theme.palette.brand.primaryDark },
  assessment: {
    flex: 1,
    gap: theme.spacing(2),
    backgroundColor: theme.palette.white,
    borderRadius: theme.borderRadius.xl,
    borderCurve: "continuous",
    padding: theme.spacing(3),
  },
  urgencyAssessment: { borderWidth: 2 },
  monitorBorder: { borderColor: theme.palette.brand.ok },
  consultSoonBorder: { borderColor: theme.palette.brand.warn },
  urgentBorder: { borderColor: theme.palette.orange["600"] },
  emergencyBorder: { borderColor: theme.palette.brand.danger },
  answerText: {
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.55,
    color: theme.palette.brand.textBody,
  },
  urgency: { fontFamily: theme.fonts.bold, color: theme.palette.brand.primaryDark },
  advice: { lineHeight: theme.fontSize.base * 1.45, color: theme.palette.brand.textBody },
  disclaimer: {
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.45,
    color: theme.palette.brand.textSecondary,
    marginTop: theme.spacing(1),
  },
  emergency: {
    alignSelf: "stretch",
    gap: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.palette.brand.danger,
    borderRadius: theme.borderRadius["2xl"],
    borderCurve: "continuous",
    backgroundColor: theme.palette.brand.dangerBg,
    padding: theme.spacing(4),
  },
  emergencyText: {
    fontFamily: theme.fonts.bold,
    color: theme.palette.brand.danger,
    lineHeight: theme.fontSize.base * 1.5,
  },
  emergencyDisclaimer: {
    fontSize: theme.fontSize.xs,
    lineHeight: theme.fontSize.xs * 1.45,
    color: theme.palette.brand.danger,
  },
}));
