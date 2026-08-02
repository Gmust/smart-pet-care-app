import { CARE_SECTIONS, type CareSectionConfig } from "../constants";
import { useCareDrawers } from "../hooks/useCareDrawers";

import { AddCareRuleDrawer } from "./drawers/AddCareRuleDrawer";
import { AddFoodTrackerDrawer } from "./drawers/AddFoodTrackerDrawer";
import { AddMealDrawer } from "./drawers/AddMealDrawer";
import { CareRuleSection } from "./CareRuleSection";
import { FoodTrackerSection } from "./FoodTrackerSection";
import { MealsSection } from "./MealsSection";

type Props = {
  petId: string;
};

const assertNever = (value: never): never => {
  throw new Error(`Unhandled care section config: ${JSON.stringify(value)}`);
};

export function CareTabContent({ petId }: Props) {
  const drawers = useCareDrawers();

  const renderSection = (config: CareSectionConfig) => {
    switch (config.renderer) {
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
      case "careRule":
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
        return assertNever(config);
    }
  };

  return (
    <>
      {CARE_SECTIONS.map(renderSection)}

      <AddMealDrawer
        petId={petId}
        isOpen={drawers.isOpen && drawers.drawer?.type === "meal"}
        setIsOpen={(open) => !open && drawers.close()}
        meal={drawers.drawer?.type === "meal" ? drawers.drawer.meal : undefined}
      />
      <AddCareRuleDrawer
        petId={petId}
        isOpen={drawers.isOpen && drawers.drawer?.type === "careRule"}
        setIsOpen={(open) => !open && drawers.close()}
        category={drawers.drawer?.type === "careRule" ? drawers.drawer.category : undefined}
        rule={drawers.drawer?.type === "careRule" ? drawers.drawer.rule : undefined}
      />
      <AddFoodTrackerDrawer
        petId={petId}
        isOpen={drawers.isOpen && drawers.drawer?.type === "foodTracker"}
        setIsOpen={(open) => !open && drawers.close()}
        tracker={drawers.drawer?.type === "foodTracker" ? drawers.drawer.tracker : undefined}
      />
    </>
  );
}
