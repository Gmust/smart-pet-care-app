import { useState } from "react";

import type {
  CareCategory,
  CareRule,
  FoodTracker,
  MealRule,
  PlannedHealthEvent,
  PlannedHealthEventCategory,
} from "../types";

type CareDrawerState =
  | { type: "meal"; meal?: MealRule }
  | { type: "careRule"; category: CareCategory; rule?: CareRule }
  | { type: "plannedHealthEvent"; category: PlannedHealthEventCategory; event?: PlannedHealthEvent }
  | { type: "foodTracker"; tracker?: FoodTracker }
  | null;

export function useCareDrawers() {
  const [drawer, setDrawer] = useState<CareDrawerState>(null);

  return {
    drawer,
    close: () => setDrawer(null),
    openAddMeal: () => setDrawer({ type: "meal" }),
    openEditMeal: (meal: MealRule) => setDrawer({ type: "meal", meal }),
    openAddCareRule: (category: CareCategory) => setDrawer({ type: "careRule", category }),
    openEditCareRule: (rule: CareRule) =>
      setDrawer({ type: "careRule", category: rule.category, rule }),
    openAddPlannedHealthEvent: (category: PlannedHealthEventCategory) =>
      setDrawer({ type: "plannedHealthEvent", category }),
    openEditPlannedHealthEvent: (event: PlannedHealthEvent) =>
      setDrawer({ type: "plannedHealthEvent", category: event.category, event }),
    openAddFoodTracker: () => setDrawer({ type: "foodTracker" }),
    openEditFoodTracker: (tracker: FoodTracker) => setDrawer({ type: "foodTracker", tracker }),
  };
}
