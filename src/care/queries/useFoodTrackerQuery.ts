import { useQuery } from "@tanstack/react-query";

import { foodTrackerMock } from "../api/mock/foodTracker.mock";
import { careQueryKeys } from "./queryKeys";

export function useFoodTrackerQuery(petId: string | undefined) {
  return useQuery({
    enabled: !!petId,
    queryKey: careQueryKeys.foodTracker(petId ?? ""),
    queryFn: () => foodTrackerMock.list(petId ?? ""),
  });
}
