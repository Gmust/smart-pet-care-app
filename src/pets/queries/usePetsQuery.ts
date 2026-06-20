import { useQuery } from "@tanstack/react-query";

import { getApiPets } from "@/api";

export function usePetsQuery() {
  return useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const response = await getApiPets();
      return response.data;
    },
  });
}
