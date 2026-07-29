import type {
  CareCategory,
  CareTranslationKey,
  DayOfWeek,
  PlannedHealthEventCategory,
  RecurrenceType,
} from "./types";

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

/**
 * Title field placeholder, per category. Only relevant for the categories
 * where AddCareRuleDrawer actually renders a free-text title field
 * (VetVisit, Weighing, Walking) — fixed-slot categories use
 * CARE_CATEGORY_LABEL_KEYS as the title instead and never show this field.
 * Falls back to "care:forms.careRule.placeholders.title" if a category
 * isn't listed here.
 */
export const CARE_CATEGORY_TITLE_PLACEHOLDER_KEYS: Partial<
  Record<CareCategory, CareTranslationKey>
> = {
  VetVisit: "forms.careRule.placeholders.titleVetVisit",
  Weighing: "forms.careRule.placeholders.titleWeighing",
  Walking: "forms.careRule.placeholders.titleWalking",
};

export const RECURRENCE_TYPE_DEFAULT_INTERVAL = 1;

/** Defaults applied to the recurrence fields when creating a new CareRule for a category. */
export type CareRuleRecurrenceDefaults = {
  recurrenceType: RecurrenceType;
  intervalN?: number;
  weekDays?: DayOfWeek[];
};

type GroomingCategory =
  | "Bathing"
  | "Brushing"
  | "EarCleaning"
  | "NailTrimming"
  | "PawCare"
  | "TeethCleaning";

/**
 * Grooming sub-categories don't share a sensible "every N weeks" default —
 * each has its own realistic cadence, so RECURRENCE_TYPE_DEFAULT_INTERVAL
 * (a generic 1) doesn't fit all of them.
 */
const GROOMING_DEFAULT_INTERVAL_WEEKS: Record<GroomingCategory, number> = {
  Bathing: 6, // every ~1.5 months
  Brushing: 1, // weekly
  EarCleaning: 3, // every 3 weeks
  NailTrimming: 4, // every ~month
  PawCare: 2, // every 2 weeks
  TeethCleaning: 1, // weekly
};

/**
 * Per-category recurrence defaults, prefilled when the "Add" drawer opens
 * for a fresh rule. Editing an existing rule always uses the rule's own
 * values instead (see AddCareRuleDrawer's reset effect).
 */
export const CARE_CATEGORY_DEFAULT_RECURRENCE: Partial<
  Record<CareCategory, CareRuleRecurrenceDefaults>
> = {
  VetVisit: { recurrenceType: "Yearly" },
  Weighing: { recurrenceType: "Weekly", weekDays: [] },
  Walking: { recurrenceType: "Daily" },
  Bathing: {
    recurrenceType: "EveryNWeeks",
    intervalN: GROOMING_DEFAULT_INTERVAL_WEEKS.Bathing,
    weekDays: [],
  },
  Brushing: {
    recurrenceType: "EveryNWeeks",
    intervalN: GROOMING_DEFAULT_INTERVAL_WEEKS.Brushing,
    weekDays: [],
  },
  EarCleaning: {
    recurrenceType: "EveryNWeeks",
    intervalN: GROOMING_DEFAULT_INTERVAL_WEEKS.EarCleaning,
    weekDays: [],
  },
  NailTrimming: {
    recurrenceType: "EveryNWeeks",
    intervalN: GROOMING_DEFAULT_INTERVAL_WEEKS.NailTrimming,
    weekDays: [],
  },
  PawCare: {
    recurrenceType: "EveryNWeeks",
    intervalN: GROOMING_DEFAULT_INTERVAL_WEEKS.PawCare,
    weekDays: [],
  },
  TeethCleaning: {
    recurrenceType: "EveryNWeeks",
    intervalN: GROOMING_DEFAULT_INTERVAL_WEEKS.TeethCleaning,
    weekDays: [],
  },
};
