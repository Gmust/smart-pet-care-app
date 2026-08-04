import { useMutation, useQueryClient } from "@tanstack/react-query";

import { careRulesMock } from "../api/mock/careRules.mock";
import type { CareRule } from "../types";

import { careQueryKeys } from "./queryKeys";

export function useCreateCareRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-care-rule"],
    mutationFn: (input: Omit<CareRule, "id">) => careRulesMock.create(input),
    onSuccess: (_created, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.careRules(variables.petId) });
    },
  });
}
