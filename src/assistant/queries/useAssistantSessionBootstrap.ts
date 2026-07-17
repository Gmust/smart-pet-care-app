import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { ChatSessionResponseDto } from "@/api/generated";

import { selectLatestPetSession } from "../utils/assistantMessages";
import { assistantQueryKeys } from "./assistantQueryKeys";
import { useAssistantSessionsQuery } from "./useAssistantSessionsQuery";
import { useCreateAssistantSessionMutation } from "./useCreateAssistantSessionMutation";

interface ActiveSession {
  petId: string;
  session: ChatSessionResponseDto;
}

export const useAssistantSessionBootstrap = (petId: string | null, enabled: boolean) => {
  const queryClient = useQueryClient();
  const sessionsQuery = useAssistantSessionsQuery(enabled && petId !== null);
  const createSession = useCreateAssistantSessionMutation();
  const createError = createSession.error;
  const createIsError = createSession.isError;
  const createIsPending = createSession.isPending;
  const createMutate = createSession.mutate;
  const createMutateAsync = createSession.mutateAsync;
  const resetCreate = createSession.reset;
  const refetchSessions = sessionsQuery.refetch;
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const attemptedPetIdRef = useRef<string | null>(null);
  const currentPetIdRef = useRef<string | null>(petId);

  useEffect(() => {
    currentPetIdRef.current = petId;
    attemptedPetIdRef.current = null;
    setActive((current) => (current?.petId === petId ? current : null));
    resetCreate();
  }, [petId, resetCreate]);

  useEffect(() => {
    if (!enabled || !petId || !sessionsQuery.isSuccess) return;

    const existing = selectLatestPetSession(sessionsQuery.data, petId);
    if (existing) {
      setActive({ petId, session: existing });
      return;
    }

    if (attemptedPetIdRef.current === petId || createIsPending) return;
    attemptedPetIdRef.current = petId;
    createMutate(petId, {
      onSuccess: (session) => {
        if (currentPetIdRef.current === petId) setActive({ petId, session });
      },
    });
  }, [
    createIsPending,
    createMutate,
    enabled,
    petId,
    retryVersion,
    sessionsQuery.data,
    sessionsQuery.isSuccess,
  ]);

  const createNewSession = useCallback(async (): Promise<ChatSessionResponseDto | null> => {
    if (!petId || createIsPending) return null;
    const requestedPetId = petId;
    const session = await createMutateAsync(requestedPetId);
    if (currentPetIdRef.current === requestedPetId) {
      setActive({ petId: requestedPetId, session });
      return session;
    }
    return null;
  }, [createIsPending, createMutateAsync, petId]);

  const retry = useCallback(() => {
    attemptedPetIdRef.current = null;
    resetCreate();
    setRetryVersion((current) => current + 1);
    void refetchSessions();
  }, [refetchSessions, resetCreate]);

  const recoverMissingSession = useCallback(
    (sessionId: string) => {
      queryClient.setQueryData<ChatSessionResponseDto[]>(
        assistantQueryKeys.sessions(),
        (sessions) => sessions?.filter((session) => session.sessionId !== sessionId)
      );
      queryClient.removeQueries({ queryKey: assistantQueryKeys.messages(sessionId) });
      attemptedPetIdRef.current = null;
      setActive(null);
      setRetryVersion((current) => current + 1);
      void queryClient.invalidateQueries({ queryKey: assistantQueryKeys.sessions() });
    },
    [queryClient]
  );

  return {
    activeSession: active?.petId === petId ? active.session : null,
    createNewSession,
    recoverMissingSession,
    retry,
    error: sessionsQuery.error ?? createError,
    isError: sessionsQuery.isError || createIsError,
    isLoading:
      enabled &&
      petId !== null &&
      (sessionsQuery.isPending || (!active && !sessionsQuery.isError && !createIsError)),
    isCreating: createIsPending,
  };
};
