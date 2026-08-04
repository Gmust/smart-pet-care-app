import { useState } from "react";

import type { CareCategory, CareRule, FoodTracker, MealRule } from "../types";

type CareDrawerContent =
  | { type: "meal"; meal?: MealRule }
  | { type: "careRule"; category: CareCategory; rule?: CareRule }
  | { type: "foodTracker"; tracker?: FoodTracker };

export function useCareDrawers() {
  const [content, setContent] = useState<CareDrawerContent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = (next: CareDrawerContent) => {
    setContent(next);
    setIsOpen(true);
  };

  return {
    drawer: content,
    isOpen,
    close: () => setIsOpen(false),
    openAddMeal: () => open({ type: "meal" }),
    openEditMeal: (meal: MealRule) => open({ type: "meal", meal }),
    openAddCareRule: (category: CareCategory) => open({ type: "careRule", category }),
    openEditCareRule: (rule: CareRule) => open({ type: "careRule", category: rule.category, rule }),
    openAddFoodTracker: () => open({ type: "foodTracker" }),
    openEditFoodTracker: (tracker: FoodTracker) => open({ type: "foodTracker", tracker }),
  };
}
