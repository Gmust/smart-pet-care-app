import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdWeightHistory } from "@/api";

import { feedingQueryKeys } from "./feedingQueryKeys";

type Params = {
  petId: string | undefined;
  from?: string;
  to?: string;
};

export const useWeightHistoryQuery = ({ petId, from, to }: Params) => {
  return useQuery({
    enabled: !!petId,
    queryKey: feedingQueryKeys.weightInRange(petId ?? "", from, to),
    queryFn: async () => {
      const response = await getApiPetsPetIdWeightHistory(petId ?? "", {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      });
      return response.data;
    },
  });
};
