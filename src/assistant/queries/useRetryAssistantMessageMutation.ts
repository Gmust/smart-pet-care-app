import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiSessionsSessionIdMessagesMessageIdRetry } from "@/api";

import { assistantQueryKeys } from "./assistantQueryKeys";

interface RetryAssistantMessageVariables {
  sessionId: string;
  messageId: string;
}

export const useRetryAssistantMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["assistant", "retry-message"],
    mutationFn: async ({ sessionId, messageId }: RetryAssistantMessageVariables) => {
      const response = await postApiSessionsSessionIdMessagesMessageIdRetry(sessionId, messageId);
      return response.data;
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: assistantQueryKeys.messages(variables.sessionId),
      });
      void queryClient.invalidateQueries({ queryKey: assistantQueryKeys.sessions() });
    },
  });
};
