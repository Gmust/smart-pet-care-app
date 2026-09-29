import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdHealthRecords } from "@/api";

import type { HealthRecordFormCategory } from "../types";

import { healthQueryKeys } from "./healthQueryKeys";

type Params = {
  petId: string | undefined;
  type: HealthRecordFormCategory | undefined;
  from?: string;
  to?: string;
};

export function useHealthRecordsByTypeQuery({ petId, type, from, to }: Params) {
  return useQuery({
    enabled: !!petId && !!type,
    queryKey: healthQueryKeys.recordsByType(petId ?? "", type ?? "", from, to),
    queryFn: async () => {
      const response = await getApiPetsPetIdHealthRecords(petId ?? "", { type, from, to });
      return response.data;
    },
  });
}
