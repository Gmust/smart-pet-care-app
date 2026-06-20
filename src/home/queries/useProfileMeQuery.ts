import { useQuery } from "@tanstack/react-query";

import { getApiProfileMe } from "@/api";

export function useProfileMeQuery() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await getApiProfileMe();
      return response.data;
    },
  });
}
