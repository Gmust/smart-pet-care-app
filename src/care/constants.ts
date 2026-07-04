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
    titleKey: "sections.meals.title",
    headerActionLabelKey: "sections.meals.editAction",
  },
  {
    key: "foodTracker",
    variant: "foodTracker",
    titleKey: "sections.foodTracker.title",
    headerActionLabelKey: "sections.foodTracker.addAction",
  },
  {
    key: "vetVisit",
    variant: "single",
    titleKey: "sections.vetVisit.title",
    fixedCareCategories: ["VetVisit"],
  },
  {
    key: "vaccination",
    variant: "growableList",
    titleKey: "sections.vaccination.title",
    headerActionLabelKey: "sections.vaccination.addAction",
    fixedPlannedHealthCategories: ["Vaccination"],
  },
  {
    key: "treatments",
    variant: "fixedSlots",
    titleKey: "sections.treatments.title",
    fixedPlannedHealthCategories: ["Deworming", "Antiparasite"],
  },
  {
    key: "weighing",
    variant: "growableList",
    titleKey: "sections.weighing.title",
    headerActionLabelKey: "sections.weighing.addAction",
    fixedCareCategories: ["Weighing"],
  },
  {
    key: "walking",
    variant: "growableList",
    titleKey: "sections.walking.title",
    headerActionLabelKey: "sections.walking.addAction",
    fixedCareCategories: ["Walking"],
  },
  {
    key: "grooming",
    variant: "fixedSlots",
    titleKey: "sections.grooming.title",
    headerActionLabelKey: "sections.grooming.manageAction",
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
