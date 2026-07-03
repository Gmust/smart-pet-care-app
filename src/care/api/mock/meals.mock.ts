import type { MealRule } from "../../types";
import { createMockCollection } from "./store";

const collection = createMockCollection<MealRule>();

export const mealsMock = {
  list: (petId: string) => collection.list(petId),
  create: (input: Omit<MealRule, "id">) => collection.create(input),
  update: (id: string, patch: Partial<Omit<MealRule, "id" | "petId">>) =>
    collection.update(id, patch),
  remove: (id: string) => collection.remove(id),
};
