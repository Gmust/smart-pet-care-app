import { CARE_SECTIONS } from "../constants";
import { useCareDrawers } from "../hooks/useCareDrawers";
import { CareRuleSection } from "./CareRuleSection";
import { AddCareRuleDrawer } from "./drawers/AddCareRuleDrawer";
import { AddFoodTrackerDrawer } from "./drawers/AddFoodTrackerDrawer";
import { AddMealDrawer } from "./drawers/AddMealDrawer";
import { AddPlannedHealthEventDrawer } from "./drawers/AddPlannedHealthEventDrawer";
import { FoodTrackerSection } from "./FoodTrackerSection";
import { MealsSection } from "./MealsSection";
import { PlannedHealthEventSection } from "./PlannedHealthEventSection";

type Props = {
  petId: string;
};

export function CareTabContent({ petId }: Props) {
  const drawers = useCareDrawers();

  return (
    <>
      {CARE_SECTIONS.map((config) => {
        switch (config.key) {
          case "meals":
            return (
              <MealsSection
                key={config.key}
                petId={petId}
                onAddMeal={drawers.openAddMeal}
                onEditMeal={drawers.openEditMeal}
              />
            );
          case "foodTracker":
            return (
              <FoodTrackerSection
                key={config.key}
                petId={petId}
                onAddFood={drawers.openAddFoodTracker}
                onEditFood={drawers.openEditFoodTracker}
              />
            );
          case "vaccination":
          case "treatments":
            return (
              <PlannedHealthEventSection
                key={config.key}
                config={config}
                petId={petId}
                onAddEvent={drawers.openAddPlannedHealthEvent}
                onEditEvent={drawers.openEditPlannedHealthEvent}
              />
            );
          case "vetVisit":
          case "weighing":
          case "walking":
          case "grooming":
            return (
              <CareRuleSection
                key={config.key}
                config={config}
                petId={petId}
                onAddRule={drawers.openAddCareRule}
                onEditRule={drawers.openEditCareRule}
              />
            );
          default:
            return null;
        }
      })}

      <AddMealDrawer
        petId={petId}
        isOpen={drawers.drawer?.type === "meal"}
        setIsOpen={(open) => !open && drawers.close()}
        meal={drawers.drawer?.type === "meal" ? drawers.drawer.meal : undefined}
      />
      <AddCareRuleDrawer
        petId={petId}
        isOpen={drawers.drawer?.type === "careRule"}
        setIsOpen={(open) => !open && drawers.close()}
        category={drawers.drawer?.type === "careRule" ? drawers.drawer.category : undefined}
        rule={drawers.drawer?.type === "careRule" ? drawers.drawer.rule : undefined}
      />
      <AddPlannedHealthEventDrawer
        petId={petId}
        isOpen={drawers.drawer?.type === "plannedHealthEvent"}
        setIsOpen={(open) => !open && drawers.close()}
        category={
          drawers.drawer?.type === "plannedHealthEvent" ? drawers.drawer.category : undefined
        }
        event={drawers.drawer?.type === "plannedHealthEvent" ? drawers.drawer.event : undefined}
      />
      <AddFoodTrackerDrawer
        petId={petId}
        isOpen={drawers.drawer?.type === "foodTracker"}
        setIsOpen={(open) => !open && drawers.close()}
        tracker={drawers.drawer?.type === "foodTracker" ? drawers.drawer.tracker : undefined}
      />
    </>
  );
}
