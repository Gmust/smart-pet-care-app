import type { CareCategory, CareTranslationKey, PlannedHealthEventCategory } from "./types";

export type MealsSectionConfig = {
  key: "meals";
  renderer: "meals";
  titleKey: CareTranslationKey;
  headerActionLabelKey?: CareTranslationKey;
};

export type FoodTrackerSectionConfig = {
  key: "foodTracker";
  renderer: "foodTracker";
  titleKey: CareTranslationKey;
  headerActionLabelKey?: CareTranslationKey;
};

/**
 * "single"       — max 1 rule (Vet Visit). No header action; tap card/empty
 *                   state to add or edit.
 * "growableList" — 1 rule → CareRuleCardSingle, 2+ → CareRuleCardListItem.
 *                   Has a header "Add X" action.
 * "fixedSlots"   — always renders one row per `fixedCareCategories` entry
 *                   (Grooming). Each row is independently "Not configured"
 *                   or filled; tapping a row opens the drawer pre-scoped to
 *                   that category.
 */
export type CareRuleSectionConfig = {
  key: "vetVisit" | "weighing" | "walking" | "grooming";
  renderer: "careRule";
  variant: "single" | "growableList" | "fixedSlots";
  titleKey: CareTranslationKey;
  headerActionLabelKey?: CareTranslationKey;
  fixedCareCategories: CareCategory[];
};

/**
 * Same variant semantics as CareRuleSectionConfig, but backed by
 * PlannedHealthEvent (vaccination / treatments) instead of CareRule.
 */
export type PlannedHealthEventSectionConfig = {
  key: "vaccination" | "treatments";
  renderer: "plannedHealthEvent";
  variant: "growableList" | "fixedSlots";
  titleKey: CareTranslationKey;
  headerActionLabelKey?: CareTranslationKey;
  fixedPlannedHealthCategories: PlannedHealthEventCategory[];
};

export type CareSectionConfig =
  | MealsSectionConfig
  | FoodTrackerSectionConfig
  | CareRuleSectionConfig
  | PlannedHealthEventSectionConfig;

export const CARE_SECTIONS: CareSectionConfig[] = [
  {
    key: "meals",
    renderer: "meals",
    titleKey: "sections.meals.title",
    headerActionLabelKey: "sections.meals.addAction",
  },
  {
    key: "foodTracker",
    renderer: "foodTracker",
    titleKey: "sections.foodTracker.title",
    headerActionLabelKey: "sections.foodTracker.addAction",
  },
  {
    key: "vetVisit",
    renderer: "careRule",
    variant: "single",
    titleKey: "sections.vetVisit.title",
    fixedCareCategories: ["VetVisit"],
  },
  {
    key: "vaccination",
    renderer: "plannedHealthEvent",
    variant: "growableList",
    titleKey: "sections.vaccination.title",
    headerActionLabelKey: "sections.vaccination.addAction",
    fixedPlannedHealthCategories: ["Vaccination"],
  },
  {
    key: "treatments",
    renderer: "plannedHealthEvent",
    variant: "fixedSlots",
    titleKey: "sections.treatments.title",
    fixedPlannedHealthCategories: ["Deworming", "Antiparasite"],
  },
  {
    key: "weighing",
    renderer: "careRule",
    variant: "growableList",
    titleKey: "sections.weighing.title",
    headerActionLabelKey: "sections.weighing.addAction",
    fixedCareCategories: ["Weighing"],
  },
  {
    key: "walking",
    renderer: "careRule",
    variant: "growableList",
    titleKey: "sections.walking.title",
    headerActionLabelKey: "sections.walking.addAction",
    fixedCareCategories: ["Walking"],
  },
  {
    key: "grooming",
    renderer: "careRule",
    variant: "fixedSlots",
    titleKey: "sections.grooming.title",
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

export const CARE_CATEGORY_LABEL_KEYS: Partial<
  Record<CareCategory | PlannedHealthEventCategory, CareTranslationKey>
> = {
  Bathing: "categoryLabels.Bathing",
  Brushing: "categoryLabels.Brushing",
  EarCleaning: "categoryLabels.EarCleaning",
  NailTrimming: "categoryLabels.NailTrimming",
  PawCare: "categoryLabels.PawCare",
  TeethCleaning: "categoryLabels.TeethCleaning",
  Deworming: "categoryLabels.Deworming",
  Antiparasite: "categoryLabels.Antiparasite",
};

export const RECURRENCE_TYPE_DEFAULT_INTERVAL = 1;
