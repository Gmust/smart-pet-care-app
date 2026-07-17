import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postApiSessions } from "@/api";
import type { ChatSessionResponseDto, SessionMessagesPageResponseDto } from "@/api/generated";

import { assistantQueryKeys } from "./assistantQueryKeys";

type AssistantMessagesData = InfiniteData<SessionMessagesPageResponseDto, string>;

const emptyMessagesData = (sessionId: string): AssistantMessagesData => ({
  pages: [
    {
      sessionId,
      items: [],
      pagination: { limit: 8, hasMore: false, nextCursor: null },
    },
  ],
  pageParams: [""],
});

export const useCreateAssistantSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["assistant", "create-session"],
    mutationFn: async (petId: string) => {
      const response = await postApiSessions({ petId });
      return response.data;
    },
    onSuccess: (session) => {
      queryClient.setQueryData<ChatSessionResponseDto[]>(
        assistantQueryKeys.sessions(),
        (current) => [
          ...(current ?? []).filter((item) => item.sessionId !== session.sessionId),
          session,
        ]
      );
      queryClient.setQueryData<AssistantMessagesData>(
        assistantQueryKeys.messages(session.sessionId),
        (current) => current ?? emptyMessagesData(session.sessionId)
      );
    },
  });
};
