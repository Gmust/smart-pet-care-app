import { useQuery } from "@tanstack/react-query";

import { getApiPetsPetIdHealthRecords } from "@/api";

import { healthQueryKeys } from "./healthQueryKeys";

export function useHealthRecordsQuery(petId: string | undefined) {
  return useQuery({
    enabled: !!petId,
    queryKey: healthQueryKeys.records(petId ?? ""),
    queryFn: async () => {
      const response = await getApiPetsPetIdHealthRecords(petId ?? "");
      return response.data;
    },
  });
}
