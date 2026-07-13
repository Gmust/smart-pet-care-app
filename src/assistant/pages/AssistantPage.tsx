import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { AccessibilityInfo, ActivityIndicator, FlatList, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { usePetsQuery } from "@/pets/queries/usePetsQuery";
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
import type {
  AssistantChatResponse,
  AssistantMessage,
  AssistantPersistedState,
} from "../schemas/assistant.schema";
import { assistantRouteParamsSchema } from "../schemas/assistant.schema";
import { hasEmergencyIndicator, mockAssistantService } from "../services/mockAssistantService";
import {
  clearAiUsingConsent,
  getAiUsingConsent,
  setAiUsingConsent,
} from "../utils/aiUsingConsentStorage";
import { ASSISTANT_PERSISTENCE_STATUS } from "../utils/assistantPersistence";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

const SCROLL_TO_END_THRESHOLD = 160;

const initialState = {
  version: 2,
  consent: null,
  selectedPetId: null,
  conversationId: null,
  messages: [],
} satisfies AssistantPersistedState;

export default function AssistantPage() {
  const { t, i18n } = useTranslation(["assistant"]);
  const router = useRouter();
  const params = assistantRouteParamsSchema.safeParse(useLocalSearchParams());
  const { data: pets, isLoading: isPetsLoading } = usePetsQuery();

  const [state, setState] = useState<AssistantPersistedState>(initialState);
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [showScrollToEnd, setShowScrollToEnd] = useState(false);
  const [consent, setConsent] = useState<boolean | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<FlatList<AssistantMessage>>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const requestCounterRef = useRef(0);
  const scopeRef = useRef(0);

  const entryPetId = params.success ? params.data.petId : undefined;
  const selectedPet = pets?.find((pet) => pet.id === (entryPetId ?? state.selectedPetId));
  const consentAccepted = Boolean(consent ?? state.consent);

  const persist = async (next: AssistantPersistedState) => {
    setState(next);
  };

  const acceptConsent = async () => {
    await setAiUsingConsent(true);
    setConsent(true);
    setState((current) => ({ ...current, consent: true }));
    setConsentDialogOpen(false);
  };

  const declineConsent = async () => {
    setConsent(null);
    setState((current) => ({ ...current, consent: null }));
    setConsentDialogOpen(false);
    await clearAiUsingConsent();
    router.replace("/(tabs)/home");
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromEnd = contentSize.height - contentOffset.y - layoutMeasurement.height;
    setShowScrollToEnd(distanceFromEnd > SCROLL_TO_END_THRESHOLD);
  };

  const send = async (rawText: string, retryRequestId?: string) => {
    const text = rawText.trim();
    if (!text || pendingRequestId || !selectedPet) return;
    requestCounterRef.current += 1;
    const requestId = retryRequestId ?? `request-${requestCounterRef.current}`;
    const userMessage: AssistantMessage = { id: `user-${requestId}`, sender: "user", text };
    const pending: AssistantMessage = {
      id: `assistant-${requestId}`,
      sender: "assistant",
      requestId,
      status: "pending",
    };
    const messages = retryRequestId
      ? state.messages.map((message) =>
          message.sender === "assistant" && message.requestId === requestId ? pending : message
        )
      : [...state.messages, userMessage, pending];
    const next = { ...state, messages };
    setPendingRequestId(requestId);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    if (hasEmergencyIndicator(text)) {
      const localEmergencyResponse: AssistantChatResponse = {
        messageId: `local-emergency-${requestId}`,
        conversationId: state.conversationId ?? `local-${requestId}`,
        mode: "emergency",
        answer: t("emergency.body"),
        prediction: null,
        relatedTopics: [],
        needsClarification: false,
        disclaimer: t("disclaimer.short"),
      };
      const settled = messages.map(
        (message): AssistantMessage =>
          message.sender === "assistant" && message.requestId === requestId
            ? { ...message, status: "complete", response: localEmergencyResponse }
            : message
      );
      await persist({ ...next, messages: settled });
      setPendingRequestId(null);
      AccessibilityInfo.announceForAccessibility(t("accessibility.emergency"));
      return;
    }

    abortRef.current = new AbortController();
    const requestScope = scopeRef.current;
    const result = await mockAssistantService.assess({
      requestId,
      locale: i18n.language,
      pet: {
        id: selectedPet.id ?? "",
        name: selectedPet.name ?? "",
        species: selectedPet.species ?? null,
      },
      messages,
      conversationId: state.conversationId,
      userText: text,
      signal: abortRef.current.signal,
    });
    if (abortRef.current.signal.aborted || requestScope !== scopeRef.current) return;
    setPendingRequestId(null);
    const settled = messages.map(
      (message): AssistantMessage =>
        message.sender === "assistant" && message.requestId === requestId
          ? result.kind === "response"
            ? { ...message, status: "complete", response: result.response }
            : { ...message, status: "failed", failure: result.failure }
          : message
    );
    await persist({
      ...next,
      messages: settled,
      conversationId:
        result.kind === "response" ? result.response.conversationId : state.conversationId,
    });
    if (result.kind === "response")
      AccessibilityInfo.announceForAccessibility(
        result.response.mode === "emergency"
          ? t("accessibility.emergency")
          : t("accessibility.newAssessment")
      );
  };

  const performReset = () => {
    scopeRef.current += 1;
    abortRef.current?.abort();
    setPendingRequestId(null);
    setState((current) => ({ ...current, messages: [], conversationId: null }));
  };

  const requestNewChat = () => {
    // An empty conversation transitions directly; a non-empty one needs confirmation.
    if (state.messages.length === 0) {
      performReset();
      return;
    }
    setNewChatDialogOpen(true);
  };

  const handleGetConsent = useCallback(async () => {
    const result = await getAiUsingConsent().catch(
      () => ({ ok: false, reason: "unavailable" }) as const
    );
    const accepted = result.ok && result.value === true;
    setConsent(accepted);
    setConsentDialogOpen(!accepted);
    setConsentChecked(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      handleGetConsent();
    }, [handleGetConsent])
  );

  useEffect(() => {
    if (isPetsLoading) return;
    const candidateId = entryPetId ?? state.selectedPetId;
    const candidateValid = Boolean(candidateId && pets?.some((pet) => pet.id === candidateId));

    if (candidateValid && candidateId) {
      if (state.selectedPetId === candidateId) return;

      // Each pet owns a separate private conversation on the server, so switching pets is
      // not destructive — it swaps context. The previous pet's conversation is not destroyed;
      // it stays on the server. Local state is cleared only because the current stopgap holds
      // one conversation in memory.
      // TODO(backend-history): load the selected pet's own conversation from the server instead
      // of clearing, so switching back restores that pet's messages.
      setState((current) => ({
        ...current,
        selectedPetId: candidateId,
        messages: current.selectedPetId ? [] : current.messages,
        conversationId: current.selectedPetId ? null : current.conversationId,
      }));
    } else if (state.selectedPetId) {
      setState((current) => ({
        ...current,
        selectedPetId: null,
        messages: [],
        conversationId: null,
      }));
    }
  }, [entryPetId, isPetsLoading, pets, state.selectedPetId]);

  useEffect(() => {
    if (isPetsLoading || !consentChecked) return;
    if (!selectedPet) router.replace("/(tabs)/assistant-pet-selection");
  }, [consentChecked, isPetsLoading, router, selectedPet]);

  if (isPetsLoading || !consentChecked || !selectedPet)
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
          <KeyboardAvoidingView style={styles.flex} behavior="padding">
            <View style={styles.listArea}>
              <FlatList
                ref={listRef}
                data={state.messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messages}
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListEmptyComponent={
                  <EmptyConversation
                    petName={selectedPet.name ?? ""}
                    onSelectPrompt={(text) => chatInputRef.current?.setDraft(text)}
                    onReviewSafety={() => setConsentDialogOpen(true)}
                  />
                }
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                renderItem={({ item }) => (
                  <MessageView
                    message={item}
                    onSelectTopic={(text) => chatInputRef.current?.setDraft(text)}
                    retry={() => {
                      const user =
                        state.messages[
                          state.messages.findIndex((message) => message.id === item.id) - 1
                        ];
                      if (user?.sender === "user" && item.sender === "assistant")
                        void send(user.text, item.requestId);
                    }}
                    dismiss={() =>
                      void persist({
                        ...state,
                        messages: state.messages.filter((message) => message.id !== item.id),
                      })
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
                inputDisabled={false}
                submitDisabled={pendingRequestId !== null}
              />
              <Text style={styles.composerNote}>{t("conversation.disclaimer")}</Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
      <NewChatDialog
        open={newChatDialogOpen}
        onOpenChange={setNewChatDialogOpen}
        onConfirm={() => {
          performReset();
          setNewChatDialogOpen(false);
        }}
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
