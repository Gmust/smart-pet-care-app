import { useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";

import { postApiSessionsSessionIdMessages } from "@/api";

import { assistantQueryKeys } from "./assistantQueryKeys";

interface SendAssistantMessageVariables {
  sessionId: string;
  text: string;
}

export const useSendAssistantMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["assistant", "send-message"],
    mutationFn: async ({ sessionId, text }: SendAssistantMessageVariables) => {
      // The backend requires a client-generated id on every send. It must be
      // globally unique to work as an idempotency key, so it cannot reuse
      // AssistantPage's `requestId`, which is a per-mount counter
      // (`request-1` recurs on every app launch).
      const response = await postApiSessionsSessionIdMessages(sessionId, {
        clientMessageId: randomUUID(),
        text,
      });
      return response.data;
    },
    onSuccess: (_response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: assistantQueryKeys.messages(variables.sessionId),
        refetchType: "none",
      });
      void queryClient.invalidateQueries({ queryKey: assistantQueryKeys.sessions() });
    },
  });
};
