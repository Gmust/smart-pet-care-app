import { CARE_SECTIONS } from "../constants";
import { CareRuleSection } from "./CareRuleSection";
import { FoodTrackerSection } from "./FoodTrackerSection";
import { MealsSection } from "./MealsSection";
import { PlannedHealthEventSection } from "./PlannedHealthEventSection";

type Props = {
  petId: string;
};

/**
 * Entry point for the Care tab. Renders every configured section; tapping a
 * card/empty-state currently no-ops — wiring up AddCareRuleDrawer /
 * AddFoodTrackerDrawer is the next step.
 */
export function CareTabContent({ petId }: Props) {
  return (
    <>
      {CARE_SECTIONS.map((config) => {
        switch (config.key) {
          case "meals":
            return <MealsSection key={config.key} petId={petId} />;
          case "foodTracker":
            return <FoodTrackerSection key={config.key} petId={petId} />;
          case "vaccination":
          case "treatments":
            return <PlannedHealthEventSection key={config.key} config={config} petId={petId} />;
          case "vetVisit":
          case "weighing":
          case "walking":
          case "grooming":
            return <CareRuleSection key={config.key} config={config} petId={petId} />;
          default:
            return null;
        }
      })}
    </>
  );
}
