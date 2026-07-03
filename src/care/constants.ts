import type { CareCategory, CareSectionKey, PlannedHealthEventCategory } from "./types";

/**
 * "meals"        — always a list of MealRow, header action = "Edit"
 * "foodTracker"  — single FoodTrackerCard entity, header action = "Add food"
 * "single"       — max 1 rule (Vet Visit). No header action; tap card/empty
 *                   state to add or edit.
 * "growableList" — 1 rule → CareRuleCardSingle, 2+ → CareRuleCardListItem.
 *                   Has a header "Add X" action.
 * "fixedSlots"   — always renders one row per `fixedCareCategories` /
 *                   `fixedPlannedHealthCategories` entry (Grooming,
 *                   Treatments). Each row is independently "Not configured"
 *                   or filled; tapping a row opens the drawer pre-scoped to
 *                   that category.
 */
export type CareSectionVariant = "meals" | "foodTracker" | "single" | "growableList" | "fixedSlots";

export type CareSectionConfig = {
  key: CareSectionKey;
  variant: CareSectionVariant;
  titleKey: string;
  /** i18n key for the header action label (e.g. "Add walk"). Omit → no header action. */
  headerActionLabelKey?: string;
  /** For sections backed by CareRule (single / growableList / fixedSlots subset). */
  fixedCareCategories?: CareCategory[];
  /** For sections backed by PlannedHealthEvent (vaccination / treatments). */
  fixedPlannedHealthCategories?: PlannedHealthEventCategory[];
};

export const CARE_SECTIONS: CareSectionConfig[] = [
  {
    key: "meals",
    variant: "meals",
    titleKey: "care:sections.meals.title",
    headerActionLabelKey: "care:sections.meals.editAction",
  },
  {
    key: "foodTracker",
    variant: "foodTracker",
    titleKey: "care:sections.foodTracker.title",
    headerActionLabelKey: "care:sections.foodTracker.addAction",
  },
  {
    key: "vetVisit",
    variant: "single",
    titleKey: "care:sections.vetVisit.title",
    fixedCareCategories: ["VetVisit"],
  },
  {
    key: "vaccination",
    variant: "growableList",
    titleKey: "care:sections.vaccination.title",
    headerActionLabelKey: "care:sections.vaccination.addAction",
    fixedPlannedHealthCategories: ["Vaccination"],
  },
  {
    key: "treatments",
    variant: "fixedSlots",
    titleKey: "care:sections.treatments.title",
    fixedPlannedHealthCategories: ["Deworming", "Antiparasite"],
  },
  {
    key: "weighing",
    variant: "growableList",
    titleKey: "care:sections.weighing.title",
    headerActionLabelKey: "care:sections.weighing.addAction",
    fixedCareCategories: ["Weighing"],
  },
  {
    key: "walking",
    variant: "growableList",
    titleKey: "care:sections.walking.title",
    headerActionLabelKey: "care:sections.walking.addAction",
    fixedCareCategories: ["Walking"],
  },
  {
    key: "grooming",
    variant: "fixedSlots",
    titleKey: "care:sections.grooming.title",
    headerActionLabelKey: "care:sections.grooming.manageAction",
    fixedCareCategories: [
      "Bathing",
      "Brushing",
      "EarCleaning",
      "NailTrimming",
      "PawCare",
      "TeethCleaning",
    ],
  },
];

export const RECURRENCE_TYPE_DEFAULT_INTERVAL = 1;
