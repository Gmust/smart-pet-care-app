import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 60, // one hour
    },
  },
  queryCache: new QueryCache(),
  mutationCache: new MutationCache(),
});
