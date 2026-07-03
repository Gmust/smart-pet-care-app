import { useQuery } from "@tanstack/react-query";

import { mealsMock } from "../api/mock/meals.mock";
import { careQueryKeys } from "./queryKeys";

export function useMealsQuery(petId: string | undefined) {
  return useQuery({
    enabled: !!petId,
    queryKey: careQueryKeys.meals(petId ?? ""),
    queryFn: () => mealsMock.list(petId ?? ""),
  });
}
