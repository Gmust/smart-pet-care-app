import { useQuery } from "@tanstack/react-query";

import { plannedHealthEventsMock } from "../api/mock/plannedHealthEvents.mock";
import { careQueryKeys } from "./queryKeys";

export function usePlannedHealthEventsQuery(petId: string | undefined) {
  return useQuery({
    enabled: !!petId,
    queryKey: careQueryKeys.plannedHealthEvents(petId ?? ""),
    queryFn: () => plannedHealthEventsMock.list(petId ?? ""),
  });
}
