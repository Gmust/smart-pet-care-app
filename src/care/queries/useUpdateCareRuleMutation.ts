import { useMutation, useQueryClient } from "@tanstack/react-query";

import { careRulesMock } from "../api/mock/careRules.mock";
import type { CareRule } from "../types";

import { careQueryKeys } from "./queryKeys";

type UpdateCareRuleInput = {
  id: string;
  petId: string;
  patch: Partial<Omit<CareRule, "id" | "petId">>;
};

export function useUpdateCareRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-care-rule"],
    mutationFn: ({ id, patch }: UpdateCareRuleInput) => careRulesMock.update(id, patch),
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.careRules(variables.petId) });
    },
  });
}
