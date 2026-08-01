import { useQuery } from "@tanstack/react-query";

import { careRulesMock } from "../api/mock/careRules.mock";

import { careQueryKeys } from "./queryKeys";

export function useCareRulesQuery(petId: string | undefined) {
  return useQuery({
    enabled: !!petId,
    queryKey: careQueryKeys.careRules(petId ?? ""),
    queryFn: () => careRulesMock.list(petId ?? ""),
  });
}
