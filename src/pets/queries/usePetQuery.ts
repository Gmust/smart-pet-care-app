import { useQuery } from "@tanstack/react-query";

import { getApiPetsId } from "@/api";

export function usePetQuery(petId: string | undefined) {
  return useQuery({
    enabled: !!petId,
    queryKey: ["pets", petId],
    queryFn: async () => {
      const response = await getApiPetsId(petId ?? "");
      return response.data;
    },
  });
}
