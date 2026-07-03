import type { CareRule } from "../../types";
import { createMockCollection } from "./store";

const collection = createMockCollection<CareRule>();

export const careRulesMock = {
  list: (petId: string) => collection.list(petId),
  create: (input: Omit<CareRule, "id">) => collection.create(input),
  update: (id: string, patch: Partial<Omit<CareRule, "id" | "petId">>) =>
    collection.update(id, patch),
  remove: (id: string) => collection.remove(id),
};
