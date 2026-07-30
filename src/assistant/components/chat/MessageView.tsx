import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ChatMessageRole, ChatMessageStatus } from "@/api/generated";
import { AiIcon } from "@/icons/ai-icon";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import type { AssistantFailureKind, AssistantTranscriptMessage } from "../../types";

import { ChatResponseView } from "./ChatResponseView";

function UserMessage({ content }: { content: string }) {
  const { t } = useTranslation(["assistant"]);
  return (
    <View style={styles.userMessage}>
      <Text
        selectable
        style={styles.userMessageText}
        accessibilityLabel={`${t("conversation.userSender")}: ${content}`}
      >
        {content}
      </Text>
    </View>
  );
}

function PendingMessage({ localEmergency }: { localEmergency: boolean }) {
  const { t } = useTranslation(["assistant"]);
  return (
    <>
      {localEmergency && (
        <View accessibilityRole="alert" style={styles.emergencyWarning}>
          <Text style={styles.emergencyWarningTitle}>{t("emergency.title")}</Text>
          <Text style={styles.emergencyWarningText}>{t("emergency.body")}</Text>
        </View>
      )}
      <View style={styles.assistantRow} accessibilityLiveRegion="polite">
        <View style={styles.assistantAvatar}>
          <AiIcon width={15} height={15} color={styles.assistantAvatarIcon.color} />
        </View>
        <View style={styles.typingBubble}>
          <ActivityIndicator size="small" color={styles.loadingIndicator.color} />
          <Text style={styles.typingText}>{t("conversation.pending")}</Text>
        </View>
      </View>
    </>
  );
}

function FailedMessage({
  retry,
  dismiss,
  retryable,
  retryAfterSeconds,
  failure,
}: {
  retry: () => void;
  dismiss?: () => void;
  retryable: boolean;
  retryAfterSeconds: number | null;
  failure?: AssistantFailureKind;
}) {
  const { t } = useTranslation(["assistant"]);
  const [remaining, setRemaining] = useState(() => Math.ceil(retryAfterSeconds ?? 0));

  useEffect(() => {
    setRemaining(Math.ceil(retryAfterSeconds ?? 0));
    if (!retryAfterSeconds || retryAfterSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfterSeconds]);

  return (
    <View accessibilityRole="alert" style={styles.failureRow}>
      <View style={styles.failure}>
        <Text style={styles.failureTitle}>{t("errors.requestTitle")}</Text>
        <Text style={styles.failureText}>
          {failure === "conflict"
            ? t("errors.retryConflict")
            : failure === "not-found"
              ? t("errors.sessionMissing")
              : failure === "rate-limited"
                ? t("errors.rateLimited")
                : t("errors.request")}
        </Text>
        {remaining > 0 && (
          <Text style={styles.failureText}>{t("errors.retryAfter", { seconds: remaining })}</Text>
        )}
        <View style={styles.failureActions}>
          {retryable && (
            <Button
              size="sm"
              accessibilityLabel={t("errors.retry")}
              disabled={remaining > 0}
              onPress={retry}
            >
              {t("errors.retry")}
            </Button>
          )}
          {dismiss && (
            <Button
              size="sm"
              accessibilityLabel={t("errors.dismiss")}
              variant="text"
              onPress={dismiss}
            >
              {t("errors.dismiss")}
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

function RestoredAssistantMessage({ content }: { content: string }) {
  const { t } = useTranslation(["assistant"]);
  return (
    <View style={styles.assistantRow} accessibilityLabel={t("conversation.assistantSender")}>
      <View style={styles.assistantAvatar}>
        <AiIcon width={15} height={15} color={styles.assistantAvatarIcon.color} />
      </View>
      <View style={styles.restoredBubble}>
        <Text selectable style={styles.restoredText}>
          {content}
        </Text>
      </View>
    </View>
  );
}

export function MessageView({
  message,
  retry,
  dismiss,
}: {
  message: AssistantTranscriptMessage;
  retry: () => void;
  dismiss?: () => void;
}) {
  if (message.kind === "optimistic-user") return <UserMessage content={message.content} />;

  if (message.kind === "pending-assistant")
    return <PendingMessage localEmergency={message.localEmergency} />;

  if (message.kind === "live-assistant")
    return <ChatResponseView response={message.response} localEmergency={message.localEmergency} />;

  if (message.kind === "failed-assistant")
    return (
      <FailedMessage
        retry={retry}
        dismiss={dismiss}
        retryable={message.retryable && message.messageId !== null}
        retryAfterSeconds={message.retryAfterSeconds}
        failure={message.failure}
      />
    );

  if (message.role === ChatMessageRole.user) return <UserMessage content={message.content} />;

  if (message.status === ChatMessageStatus.Pending)
    return <PendingMessage localEmergency={false} />;

  if (message.status === ChatMessageStatus.FailedRetryable)
    return <FailedMessage retry={retry} retryable retryAfterSeconds={null} />;

  return <RestoredAssistantMessage content={message.content} />;
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
  restoredBubble: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing(3),
    paddingVertical: theme.spacing(2),
    backgroundColor: theme.palette.white,
  },
  restoredText: {
    fontSize: theme.fontSize.base,
    lineHeight: theme.fontSize.base * 1.5,
    color: theme.palette.brand.textBody,
  },
  emergencyWarning: {
    gap: theme.spacing(2),
    borderWidth: 1,
    borderColor: theme.palette.brand.danger,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.palette.brand.dangerBg,
    padding: theme.spacing(3),
  },
  emergencyWarningTitle: { fontFamily: theme.fonts.bold, color: theme.palette.brand.danger },
  emergencyWarningText: { color: theme.palette.brand.danger },
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
