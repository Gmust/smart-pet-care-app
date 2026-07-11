import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AiIcon } from "@/icons/ai-icon";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import type { AssistantMessage } from "../../schemas/assistant.schema";
import { ChatResponseView } from "./ChatResponseView";

export function MessageView({
  message,
  retry,
  dismiss,
}: {
  message: AssistantMessage;
  retry: () => void;
  dismiss: () => void;
}) {
  const { t } = useTranslation(["assistant"]);
  if (message.sender === "user")
    return (
      <View style={styles.userMessage}>
        <Text
          selectable
          style={styles.userMessageText}
          accessibilityLabel={`${t("conversation.userSender")}: ${message.text}`}
        >
          {message.text}
        </Text>
      </View>
    );
  if (message.status === "pending")
    return (
      <View style={styles.assistantRow} accessibilityLiveRegion="polite">
        <View style={styles.assistantAvatar}>
          <AiIcon width={15} height={15} color={styles.assistantAvatarIcon.color} />
        </View>
        <View style={styles.typingBubble}>
          <ActivityIndicator size="small" color={styles.loadingIndicator.color} />
          <Text style={styles.typingText}>{t("conversation.pending")}</Text>
        </View>
      </View>
    );
  if (message.status === "failed")
    return (
      <View accessibilityRole="alert" style={styles.failureRow}>
        <View style={styles.failure}>
          <Text style={styles.failureTitle}>{t("errors.requestTitle")}</Text>
          <Text style={styles.failureText}>{t("errors.request")}</Text>
          <View style={styles.failureActions}>
            <Button size="sm" accessibilityLabel={t("errors.retry")} onPress={retry}>
              {t("errors.retry")}
            </Button>
            <Button
              size="sm"
              accessibilityLabel={t("errors.dismiss")}
              variant="text"
              onPress={dismiss}
            >
              {t("errors.dismiss")}
            </Button>
          </View>
        </View>
      </View>
    );
  return message.response ? <ChatResponseView response={message.response} /> : null;
}

const styles = StyleSheet.create((theme) => ({
  userMessage: {
    alignSelf: "flex-end",
    maxWidth: "82%",
    borderRadius: theme.borderRadius["2xl"],
    borderBottomRightRadius: theme.borderRadius.sm,
    borderCurve: "continuous",
    paddingHorizontal: theme.spacing(3.5),
    paddingVertical: theme.spacing(2.5),
    backgroundColor: theme.palette.brand.primaryDefault,
  },
  userMessageText: {
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.45,
    color: theme.palette.brand.textOnDark,
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
  typingBubble: {
    minHeight: theme.spacing(10),
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing(3),
    backgroundColor: theme.palette.white,
  },
  typingText: { fontSize: theme.fontSize.sm, color: theme.palette.brand.textSecondary },
  loadingIndicator: { color: theme.palette.brand.primaryDefault },
  failure: {
    flex: 1,
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.palette.brand.danger,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.brand.dangerBg,
    padding: theme.spacing(3.5),
  },
  failureRow: { maxWidth: "94%", paddingLeft: theme.spacing(10) },
  failureTitle: { fontFamily: theme.fonts.semiBold, color: theme.palette.brand.danger },
  failureText: { lineHeight: theme.fontSize.base * 1.4, color: theme.palette.brand.textBody },
  failureActions: { flexDirection: "row", alignItems: "center", gap: theme.spacing(2) },
}));
