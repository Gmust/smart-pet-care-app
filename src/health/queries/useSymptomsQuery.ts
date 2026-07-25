import { useQuery } from "@tanstack/react-query";

import { getApiSymptoms } from "@/api";

import { healthQueryKeys } from "./healthQueryKeys";

export function useSymptomsQuery() {
  return useQuery({
    queryKey: healthQueryKeys.symptoms(),
    queryFn: async () => {
      const response = await getApiSymptoms();
      return response.data;
    },
    staleTime: Infinity,
  });
}
