import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      const response = await postApiSessionsSessionIdMessages(sessionId, { text });
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
