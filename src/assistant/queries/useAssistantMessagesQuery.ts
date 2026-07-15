import { useMemo } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getApiSessionsSessionIdMessages } from "@/api";
import type { SessionMessagesPageResponseDto } from "@/api/generated";

import { mergeMessagePages } from "../utils/assistantMessages";
import { assistantQueryKeys } from "./assistantQueryKeys";

type AssistantMessagesData = InfiniteData<SessionMessagesPageResponseDto, string>;

export const useAssistantMessagesQuery = (sessionId: string | null, enabled: boolean) => {
  const query = useInfiniteQuery<
    SessionMessagesPageResponseDto,
    Error,
    AssistantMessagesData,
    ReturnType<typeof assistantQueryKeys.messages>,
    string
  >({
    enabled: enabled && sessionId !== null,
    queryKey: assistantQueryKeys.messages(sessionId ?? "inactive"),
    initialPageParam: "",
    queryFn: async ({ pageParam, signal }) => {
      if (!sessionId) throw new Error("An active assistant session is required");
      const response = await getApiSessionsSessionIdMessages(
        sessionId,
        pageParam ? { limit: 8, cursor: pageParam } : { limit: 8 },
        { signal }
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const { hasMore, nextCursor } = lastPage.pagination;
      return hasMore && nextCursor ? nextCursor : undefined;
    },
  });

  const messages = useMemo(() => mergeMessagePages(query.data?.pages ?? []), [query.data?.pages]);

  return { ...query, messages };
};
