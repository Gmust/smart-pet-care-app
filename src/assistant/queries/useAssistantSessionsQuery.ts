import { useQuery } from "@tanstack/react-query";

import { getApiSessions } from "@/api";

import { assistantQueryKeys } from "./assistantQueryKeys";

export const useAssistantSessionsQuery = (enabled: boolean) =>
  useQuery({
    enabled,
    queryKey: assistantQueryKeys.sessions(),
    queryFn: async ({ signal }) => {
      const response = await getApiSessions({ signal });
      return response.data;
    },
  });
