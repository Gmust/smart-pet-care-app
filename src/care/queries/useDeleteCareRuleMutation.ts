import { useMutation, useQueryClient } from "@tanstack/react-query";

import { careRulesMock } from "../api/mock/careRules.mock";

import { careQueryKeys } from "./queryKeys";

type DeleteCareRuleInput = { id: string; petId: string };

export function useDeleteCareRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-care-rule"],
    mutationFn: ({ id }: DeleteCareRuleInput) => careRulesMock.remove(id),
    onSuccess: (_void, variables) => {
      queryClient.invalidateQueries({ queryKey: careQueryKeys.careRules(variables.petId) });
    },
  });
}
