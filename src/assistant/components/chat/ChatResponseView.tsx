import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AccessibilityInfo, Linking, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AiIcon } from "@/icons/ai-icon";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import type { AssistantChatResponse } from "../../schemas/assistant.schema";
import { PredictionCard } from "./PredictionCard";

const EMERGENCY_VET_SEARCH_URL =
  "https://www.google.com/maps/search/?api=1&query=emergency+veterinary+clinic";

export function ChatResponseView({
  response,
  onSelectTopic,
}: {
  response: AssistantChatResponse;
  onSelectTopic?: (text: string) => void;
}) {
  const { t } = useTranslation(["assistant"]);

  const [emergencyLinkFailed, setEmergencyLinkFailed] = useState(false);

  const openEmergencyVetSearch = async () => {
    try {
      const canOpen = await Linking.canOpenURL(EMERGENCY_VET_SEARCH_URL);
      if (!canOpen) throw new Error("unsupported");
      await Linking.openURL(EMERGENCY_VET_SEARCH_URL);
    } catch {
      setEmergencyLinkFailed(true);
      AccessibilityInfo.announceForAccessibility(t("accessibility.emergencyActionUnavailable"));
    }
  };

  if (response.mode === "emergency")
    return (
      <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.emergency}>
        <Text accessibilityRole="header" style={styles.title}>
          ⚠ {t("emergency.title")}
        </Text>
        <Text style={styles.emergencyText}>{response.answer}</Text>
        {response.prediction?.homeAdvice.map((advice) => (
          <Text key={advice} style={styles.emergencyText}>
            • {advice}
          </Text>
        ))}
        <Button
          variant="danger"
          accessibilityLabel={t("emergency.findVet")}
          accessibilityHint={t("emergency.findVetHint")}
          onPress={() => void openEmergencyVetSearch()}
        >
          {t("emergency.findVet")}
        </Button>
        {emergencyLinkFailed && (
          <Text accessibilityLiveRegion="polite" style={styles.emergencyFallback}>
            {t("emergency.findVetFailed")}
          </Text>
        )}
      </View>
    );

  if (response.mode === "general")
    return (
      <View style={styles.assistantRow} accessibilityLabel={t("conversation.assistantSender")}>
        <View style={styles.assistantAvatar}>
          <AiIcon width={15} height={15} color={styles.assistantAvatarIcon.color} />
        </View>
        <View style={styles.assessment}>
          <Text selectable style={styles.answerText}>
            {response.answer}
          </Text>
          {response.relatedTopics.length > 0 && (
            <View style={styles.chipRow}>
              {response.relatedTopics.map((topic) =>
                onSelectTopic ? (
                  <Pressable
                    key={topic}
                    accessibilityRole="button"
                    accessibilityLabel={topic}
                    accessibilityHint={t("hints.send")}
                    onPress={() => onSelectTopic(topic)}
                    style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                  >
                    <Text style={styles.chipText}>{topic}</Text>
                  </Pressable>
                ) : (
                  <View key={topic} style={styles.chip}>
                    <Text style={styles.chipText}>{topic}</Text>
                  </View>
                )
              )}
            </View>
          )}
        </View>
      </View>
    );

  return (
    <View style={styles.assistantRow} accessibilityLabel={t("conversation.assistantSender")}>
      <View style={styles.assistantAvatar}>
        <AiIcon width={15} height={15} color={styles.assistantAvatarIcon.color} />
      </View>
      <View style={styles.assessment}>
        <Text
          selectable
          style={[styles.answerText, response.needsClarification && styles.clarificationQuestion]}
        >
          {response.answer}
        </Text>
        {response.prediction && (
          <PredictionCard
            prediction={response.prediction}
            deemphasized={response.needsClarification}
          />
        )}
        <Text style={styles.disclaimer}>{response.disclaimer}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  pressed: { opacity: 0.72 },
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
    paddingTop: theme.spacing(1),
  },
  answerText: {
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.55,
    color: theme.palette.brand.textBody,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing(2) },
  chip: {
    minHeight: theme.spacing(11),
    justifyContent: "center",
    backgroundColor: theme.palette.brand.primaryXsoft,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(1),
  },
  chipText: { color: theme.palette.brand.primaryDark, fontSize: theme.fontSize.sm },
  clarificationQuestion: { fontFamily: theme.fonts.bold },
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
  emergencyFallback: {
    fontFamily: theme.fonts.semiBold,
    color: theme.palette.brand.danger,
    lineHeight: theme.fontSize.base * 1.45,
  },
}));
