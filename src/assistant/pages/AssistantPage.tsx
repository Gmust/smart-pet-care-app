import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { AccessibilityInfo, ActivityIndicator, FlatList, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { ChatMessageStatus, ClassifierUrgency } from "@/api/generated";
import { usePetsQuery } from "@/pets/queries/usePetsQuery";
import { Button } from "@/shadecn/ui/button";
import { Text } from "@/shadecn/ui/text";

import { ChatHeader } from "../components/chat/chat-header/ChatHeader";
import type { ChatInputHandle } from "../components/chat/ChatInput";
import { ChatInput } from "../components/chat/ChatInput";
import { EmptyConversation } from "../components/chat/EmptyConversation";
import { MessageView } from "../components/chat/MessageView";
import { ScrollToEndButton } from "../components/chat/ScrollToEndButton";
import { ConsentDialog } from "../components/dialogs/ConsentDialog";
import { NewChatDialog } from "../components/dialogs/NewChatDialog";
import { PetSelectorChip } from "../components/pet-selection/PetSelectorChip";
import { useAssistantMessagesQuery } from "../queries/useAssistantMessagesQuery";
import { useAssistantSessionBootstrap } from "../queries/useAssistantSessionBootstrap";
import { useRetryAssistantMessageMutation } from "../queries/useRetryAssistantMessageMutation";
import { useSendAssistantMessageMutation } from "../queries/useSendAssistantMessageMutation";
import { assistantRouteParamsSchema } from "../schemas/assistant.schema";
import type { AssistantTranscriptMessage } from "../types";
import {
  clearAiUsingConsent,
  getAiUsingConsent,
  setAiUsingConsent,
} from "../utils/aiUsingConsentStorage";
import { hasEmergencyIndicator } from "../utils/assistantEmergency";
import { getAssistantApiError, isAssistantNotFoundError } from "../utils/assistantErrors";
import { ASSISTANT_PERSISTENCE_STATUS } from "../utils/assistantPersistence";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

const SCROLL_TO_END_THRESHOLD = 160;

export default function AssistantPage() {
  const { t } = useTranslation(["assistant"]);
  const router = useRouter();
  const params = assistantRouteParamsSchema.safeParse(useLocalSearchParams());
  const { data: pets, isLoading: isPetsLoading } = usePetsQuery();

  const [localTranscript, setLocalTranscript] = useState<{
    sessionId: string | null;
    messages: AssistantTranscriptMessage[];
  }>({ sessionId: null, messages: [] });
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [showScrollToEnd, setShowScrollToEnd] = useState(false);
  const [consent, setConsent] = useState<boolean | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);

  const listRef = useRef<FlatList<AssistantTranscriptMessage>>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const requestCounterRef = useRef(0);
  const isSendingRef = useRef(false);

  const entryPetId = params.success ? params.data.petId : undefined;
  const selectedPet = pets?.find((pet) => pet.id === entryPetId);
  const selectedPetId = selectedPet?.id ?? null;
  const consentAccepted = consent === true;
  const sessionBootstrap = useAssistantSessionBootstrap(
    selectedPetId,
    consentChecked && consentAccepted
  );
  const activeSessionId = sessionBootstrap.activeSession?.sessionId ?? null;
  const messagesQuery = useAssistantMessagesQuery(
    activeSessionId,
    consentChecked && consentAccepted
  );
  const sendMessage = useSendAssistantMessageMutation();
  const retryMessage = useRetryAssistantMessageMutation();
  const recoverMissingSession = sessionBootstrap.recoverMissingSession;
  const activeSessionIdRef = useRef<string | null>(activeSessionId);
  activeSessionIdRef.current = activeSessionId;

  const transcript = useMemo(() => {
    const liveMessages =
      localTranscript.sessionId === activeSessionId ? localTranscript.messages : [];
    const replacedServerIds = new Set<string>();
    for (const message of liveMessages) {
      if (
        (message.kind === "live-assistant" || message.kind === "failed-assistant") &&
        message.serverMessageId
      )
        replacedServerIds.add(message.serverMessageId);
    }
    return [
      ...messagesQuery.messages.filter((message) => !replacedServerIds.has(message.messageId)),
      ...liveMessages,
    ];
  }, [activeSessionId, localTranscript, messagesQuery.messages]);

  const acceptConsent = async () => {
    await setAiUsingConsent(true);
    setConsent(true);
    setConsentDialogOpen(false);
  };

  const declineConsent = async () => {
    setConsent(null);
    setConsentDialogOpen(false);
    await clearAiUsingConsent();
    router.replace("/(tabs)/home");
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromEnd = contentSize.height - contentOffset.y - layoutMeasurement.height;
    setShowScrollToEnd(distanceFromEnd > SCROLL_TO_END_THRESHOLD);
    if (contentOffset.y <= 80 && messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage)
      void messagesQuery.fetchNextPage();
  };

  const send = async (rawText: string) => {
    const text = rawText.trim();
    const sessionId = activeSessionId;
    if (!text || !sessionId || isSendingRef.current || sendMessage.isPending) return;
    isSendingRef.current = true;
    requestCounterRef.current += 1;
    const requestId = `request-${requestCounterRef.current}`;
    const localEmergency = hasEmergencyIndicator(text);
    const userMessage: AssistantTranscriptMessage = {
      kind: "optimistic-user",
      id: `user-${requestId}`,
      requestId,
      role: "user",
      content: text,
    };
    const pending: AssistantTranscriptMessage = {
      kind: "pending-assistant",
      id: `assistant-${requestId}`,
      requestId,
      role: "assistant",
      localEmergency,
    };
    setLocalTranscript((current) => ({
      sessionId,
      messages: [
        ...(current.sessionId === sessionId ? current.messages : []),
        userMessage,
        pending,
      ],
    }));
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    if (localEmergency) AccessibilityInfo.announceForAccessibility(t("accessibility.emergency"));

    try {
      const response = await sendMessage.mutateAsync({ sessionId, text });
      if (activeSessionIdRef.current !== sessionId) return;
      setLocalTranscript((current) => ({
        sessionId,
        messages:
          current.sessionId === sessionId
            ? current.messages.map((message) =>
                message.kind === "pending-assistant" && message.requestId === requestId
                  ? {
                      kind: "live-assistant",
                      id: message.id,
                      requestId,
                      role: "assistant",
                      response,
                      localEmergency,
                      serverMessageId: null,
                    }
                  : message
              )
            : [],
      }));
      AccessibilityInfo.announceForAccessibility(
        response.urgentContactEmergencyVet === true ||
          response.urgency === ClassifierUrgency.EMERGENCY ||
          localEmergency
          ? t("accessibility.emergency")
          : t("accessibility.newAssessment")
      );
    } catch (error) {
      if (activeSessionIdRef.current !== sessionId) return;
      const apiError = getAssistantApiError(error);
      if (apiError.status === 404) recoverMissingSession(sessionId);
      if (apiError.retryable && !apiError.messageId) void messagesQuery.refetch();
      setLocalTranscript((current) => ({
        sessionId,
        messages:
          current.sessionId === sessionId
            ? current.messages.map((message) =>
                message.kind === "pending-assistant" && message.requestId === requestId
                  ? {
                      kind: "failed-assistant",
                      id: message.id,
                      requestId,
                      role: "assistant",
                      messageId: apiError.messageId,
                      serverMessageId: apiError.messageId,
                      failure:
                        apiError.status === 409
                          ? "conflict"
                          : apiError.status === 404
                            ? "not-found"
                            : apiError.status === 429
                              ? "rate-limited"
                              : "unavailable",
                      retryable: apiError.retryable,
                      retryAfterSeconds: apiError.retryAfterSeconds,
                      localEmergency,
                    }
                  : message
              )
            : [],
      }));
      AccessibilityInfo.announceForAccessibility(t("accessibility.requestFailed"));
    } finally {
      isSendingRef.current = false;
    }
  };

  const retry = async (message: AssistantTranscriptMessage) => {
    const sessionId = activeSessionId;
    const messageId =
      message.kind === "server"
        ? message.status === ChatMessageStatus.FailedRetryable
          ? message.messageId
          : null
        : message.kind === "failed-assistant"
          ? message.messageId
          : null;
    if (!sessionId || !messageId || retryMessage.isPending) {
      if (!messageId) void messagesQuery.refetch();
      return;
    }

    const requestId =
      message.kind === "failed-assistant" ? message.requestId : `retry-${messageId}`;
    const localEmergency = message.kind === "failed-assistant" ? message.localEmergency : false;

    try {
      const response = await retryMessage.mutateAsync({ sessionId, messageId });
      if (activeSessionIdRef.current !== sessionId) return;
      const liveMessage: AssistantTranscriptMessage = {
        kind: "live-assistant",
        id: `assistant-${requestId}`,
        requestId,
        role: "assistant",
        response,
        localEmergency,
        serverMessageId: messageId,
      };
      setLocalTranscript((current) => ({
        sessionId,
        messages: [
          ...(current.sessionId === sessionId
            ? current.messages.filter(
                (item) =>
                  !(
                    item.kind === "failed-assistant" &&
                    (item.requestId === requestId || item.messageId === messageId)
                  )
              )
            : []),
          liveMessage,
        ],
      }));
      AccessibilityInfo.announceForAccessibility(
        response.urgentContactEmergencyVet === true ||
          response.urgency === ClassifierUrgency.EMERGENCY ||
          localEmergency
          ? t("accessibility.emergency")
          : t("accessibility.newAssessment")
      );
    } catch (error) {
      if (activeSessionIdRef.current !== sessionId) return;
      const apiError = getAssistantApiError(error);
      if (apiError.status === 404) recoverMissingSession(sessionId);
      const failedMessage: AssistantTranscriptMessage = {
        kind: "failed-assistant",
        id: `assistant-${requestId}`,
        requestId,
        role: "assistant",
        messageId,
        serverMessageId: messageId,
        failure:
          apiError.status === 409
            ? "conflict"
            : apiError.status === 404
              ? "not-found"
              : apiError.status === 429
                ? "rate-limited"
                : "unavailable",
        retryable: apiError.retryable,
        retryAfterSeconds: apiError.retryAfterSeconds,
        localEmergency,
      };
      setLocalTranscript((current) => ({
        sessionId,
        messages: [
          ...(current.sessionId === sessionId
            ? current.messages.filter(
                (item) =>
                  !(
                    item.kind === "failed-assistant" &&
                    (item.requestId === requestId || item.messageId === messageId)
                  )
              )
            : []),
          failedMessage,
        ],
      }));
      AccessibilityInfo.announceForAccessibility(t("accessibility.requestFailed"));
    }
  };

  const createAndActivateSession = async () => {
    try {
      const session = await sessionBootstrap.createNewSession();
      if (session) setLocalTranscript({ sessionId: session.sessionId, messages: [] });
      setNewChatDialogOpen(false);
    } catch {
      setNewChatDialogOpen(false);
    }
  };

  const requestNewChat = () => {
    if (transcript.length === 0) {
      void createAndActivateSession();
      return;
    }
    setNewChatDialogOpen(true);
  };

  const handleGetConsent = useCallback(async () => {
    try {
      const result = await getAiUsingConsent();
      const accepted = result.ok && result.value === true;
      setConsent(accepted);
      setConsentDialogOpen(!accepted);
    } catch {
      setConsent(false);
      setConsentDialogOpen(true);
    } finally {
      setConsentChecked(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      handleGetConsent();
    }, [handleGetConsent])
  );

  useEffect(() => {
    if (isPetsLoading || !consentChecked) return;
    if (!selectedPet) router.replace("/(tabs)/assistant-pet-selection");
  }, [consentChecked, isPetsLoading, router, selectedPet]);

  useEffect(() => {
    if (activeSessionId && messagesQuery.error && isAssistantNotFoundError(messagesQuery.error))
      recoverMissingSession(activeSessionId);
  }, [activeSessionId, messagesQuery.error, recoverMissingSession]);

  if (isPetsLoading || !consentChecked || !selectedPet)
    return (
      <SafeAreaView style={styles.loadingScreen} edges={["top"]}>
        <ActivityIndicator color={styles.loadingIndicator.color} />
        <Text style={styles.loadingText}>{t("conversation.restoring")}</Text>
      </SafeAreaView>
    );

  if (consentAccepted && sessionBootstrap.isError && !activeSessionId)
    return (
      <SafeAreaView style={styles.loadingScreen} edges={["top"]}>
        <View accessibilityRole="alert" style={styles.stateCard}>
          <Text style={styles.stateTitle}>{t("errors.sessionTitle")}</Text>
          <Text style={styles.stateText}>{t("errors.session")}</Text>
          <Button onPress={sessionBootstrap.retry}>{t("errors.retry")}</Button>
        </View>
      </SafeAreaView>
    );

  if (
    consentAccepted &&
    (sessionBootstrap.isLoading ||
      !activeSessionId ||
      (messagesQuery.isPending && messagesQuery.messages.length === 0))
  )
    return (
      <SafeAreaView style={styles.loadingScreen} edges={["top"]}>
        <ActivityIndicator color={styles.loadingIndicator.color} />
        <Text style={styles.loadingText}>{t("conversation.restoring")}</Text>
      </SafeAreaView>
    );

  return (
    <>
      {consentAccepted && (
        <SafeAreaView style={styles.screen} edges={["top"]}>
          <ChatHeader onNewChat={requestNewChat} />
          {sessionBootstrap.isError && activeSessionId && (
            <Text accessibilityRole="alert" style={styles.warning}>
              {t("errors.newSession")}
            </Text>
          )}
          <KeyboardAvoidingView style={styles.flex} behavior="padding">
            <View style={styles.listArea}>
              <FlatList
                ref={listRef}
                data={transcript}
                accessibilityLabel={t("conversation.transcript")}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messages}
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListHeaderComponent={
                  messagesQuery.isFetchingNextPage ? (
                    <ActivityIndicator color={styles.loadingIndicator.color} />
                  ) : null
                }
                ListEmptyComponent={
                  messagesQuery.isError ? (
                    <View accessibilityRole="alert" style={styles.stateCard}>
                      <Text style={styles.stateTitle}>{t("errors.historyTitle")}</Text>
                      <Text style={styles.stateText}>{t("errors.history")}</Text>
                      <Button onPress={() => void messagesQuery.refetch()}>
                        {t("errors.retry")}
                      </Button>
                    </View>
                  ) : (
                    <EmptyConversation
                      petName={selectedPet.name ?? ""}
                      onSelectPrompt={(text) => chatInputRef.current?.setDraft(text)}
                      onReviewSafety={() => setConsentDialogOpen(true)}
                    />
                  )
                }
                onContentSizeChange={() => {
                  if (!messagesQuery.isFetchingNextPage)
                    listRef.current?.scrollToEnd({ animated: true });
                }}
                renderItem={({ item }) => (
                  <MessageView
                    message={item}
                    retry={() => void retry(item)}
                    dismiss={
                      item.kind === "failed-assistant"
                        ? () =>
                            setLocalTranscript((current) => ({
                              ...current,
                              messages: current.messages.filter(
                                (message) => message.id !== item.id
                              ),
                            }))
                        : undefined
                    }
                  />
                )}
              />
              {showScrollToEnd && (
                <ScrollToEndButton
                  onPress={() => listRef.current?.scrollToEnd({ animated: true })}
                />
              )}
            </View>
            <View style={styles.composer}>
              <View style={styles.trayCorner}>
                <PetSelectorChip selectedPet={selectedPet} />
              </View>
              <ChatInput
                ref={chatInputRef}
                onSubmit={(message) => void send(message)}
                petName={selectedPet.name ?? ""}
                inputDisabled={!activeSessionId || messagesQuery.isPending}
                submitDisabled={
                  sendMessage.isPending || retryMessage.isPending || sessionBootstrap.isCreating
                }
              />
              <Text style={styles.composerNote}>{t("conversation.disclaimer")}</Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
      <NewChatDialog
        open={newChatDialogOpen}
        onOpenChange={setNewChatDialogOpen}
        onConfirm={() => void createAndActivateSession()}
      />
      <ConsentDialog
        isOpen={consentDialogOpen}
        onOpenChange={setConsentDialogOpen}
        onAccept={() => void acceptConsent()}
        onDecline={declineConsent}
        persistenceStatus={ASSISTANT_PERSISTENCE_STATUS}
      />
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.palette.brand.surfacePage },
  flex: { flex: 1 },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(3),
    backgroundColor: theme.palette.brand.surfacePage,
  },
  loadingIndicator: { color: theme.palette.brand.primaryDefault },
  loadingText: { fontSize: theme.fontSize.sm, color: theme.palette.brand.textSecondary },
  stateCard: {
    alignItems: "center",
    gap: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.palette.brand.surfaceBorder,
    borderRadius: theme.borderRadius["2xl"],
    backgroundColor: theme.palette.white,
    padding: theme.spacing(5),
  },
  stateTitle: {
    textAlign: "center",
    fontFamily: theme.fonts.displayRegular,
    fontSize: theme.fontSize.xl,
    color: theme.palette.brand.textPrimary,
  },
  stateText: { textAlign: "center", color: theme.palette.brand.textBody },
  listArea: { flex: 1 },
  messages: {
    flexGrow: 1,
    gap: theme.spacing(4),
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(5),
  },
  trayCorner: {
    position: "absolute",
    top: -theme.spacing(14),
    right: theme.spacing(4),
    zIndex: 10,
  },
  composerNote: {
    textAlign: "center",
    fontSize: theme.fontSize.xs,
    color: theme.palette.brand.textSecondary,
  },
  warning: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.brand.danger,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(2),
    backgroundColor: theme.palette.brand.dangerBg,
    color: theme.palette.brand.danger,
  },
  composer: {
    gap: theme.spacing(1.5),
    borderTopWidth: 1,
    borderTopColor: theme.palette.brand.surfaceBorder,
    paddingHorizontal: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    backgroundColor: theme.palette.brand.surfacePage,
  },
}));
