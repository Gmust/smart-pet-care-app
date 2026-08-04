import type { CareCategory, CareTranslationKey, DayOfWeek, RecurrenceType } from "./types";

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
  key: "vetVisit" | "weighing" | "activity" | "vaccination" | "treatments" | "grooming";
  renderer: "careRule";
  variant: "single" | "growableList" | "fixedSlots";
  titleKey: CareTranslationKey;
  headerActionLabelKey?: CareTranslationKey;
  fixedCareCategories: CareCategory[];
};

export type CareSectionConfig =
  | MealsSectionConfig
  | FoodTrackerSectionConfig
  | CareRuleSectionConfig;

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
    renderer: "careRule",
    variant: "growableList",
    titleKey: "sections.vaccination.title",
    headerActionLabelKey: "sections.vaccination.addAction",
    fixedCareCategories: ["Vaccination"],
  },
  {
    key: "treatments",
    renderer: "careRule",
    variant: "fixedSlots",
    titleKey: "sections.treatments.title",
    fixedCareCategories: ["Deworming", "Antiparasite"],
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
    key: "activity",
    renderer: "careRule",
    variant: "growableList",
    titleKey: "sections.activity.title",
    headerActionLabelKey: "sections.activity.addAction",
    fixedCareCategories: ["Activity"],
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

export const CARE_CATEGORY_LABEL_KEYS: Partial<Record<CareCategory, CareTranslationKey>> = {
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
 * Display name for every category, used to make the add/edit drawer title
 * category-specific ("Add Deworming"). Deliberately separate from
 * CARE_CATEGORY_LABEL_KEYS, which doubles as the "hide title field"
 * (isFixedSlot) flag — adding VetVisit/Weighing/Activity/Vaccination there
 * would wrongly turn them into fixed-slot categories.
 */
export const CARE_CATEGORY_NAME_KEYS: Record<CareCategory, CareTranslationKey> = {
  VetVisit: "sections.vetVisit.title",
  Weighing: "sections.weighing.title",
  Activity: "sections.activity.title",
  Vaccination: "sections.vaccination.title",
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
 * (VetVisit, Weighing, Activity, Vaccination) — fixed-slot categories use
 * CARE_CATEGORY_LABEL_KEYS as the title instead and never show this field.
 * Falls back to "care:forms.careRule.placeholders.title" if a category
 * isn't listed here.
 */
export const CARE_CATEGORY_TITLE_PLACEHOLDER_KEYS: Partial<
  Record<CareCategory, CareTranslationKey>
> = {
  VetVisit: "forms.careRule.placeholders.titleVetVisit",
  Weighing: "forms.careRule.placeholders.titleWeighing",
  Activity: "forms.careRule.placeholders.titleActivity",
  Vaccination: "forms.careRule.placeholders.titleVaccination",
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
  Activity: { recurrenceType: "Daily" },
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
  Vaccination: { recurrenceType: "Yearly" },
  Deworming: { recurrenceType: "EveryNMonths", intervalN: 3 },
  Antiparasite: { recurrenceType: "EveryNWeeks", intervalN: 4 },
};

/**
 * Recurrence types selectable in AddCareRuleDrawer, per category. Falls back
 * to every RecurrenceType when a category isn't listed here.
 *
 * - VetVisit: Yearly / EveryNMonths (checkups don't happen weekly/daily).
 * - Vaccination/Deworming/Antiparasite: EveryNWeeks / EveryNMonths / Yearly
 *   — no Daily/Weekly, that cadence isn't medically meaningful for these.
 * - Everything else (Weighing, Activity, Grooming): Daily / Weekly /
 *   EveryNWeeks / EveryNMonths, no Yearly.
 */
export const CARE_CATEGORY_ALLOWED_RECURRENCE_TYPES: Partial<
  Record<CareCategory, RecurrenceType[]>
> = {
  VetVisit: ["Yearly", "EveryNMonths"],
  Vaccination: ["EveryNWeeks", "EveryNMonths", "Yearly"],
  Deworming: ["EveryNWeeks", "EveryNMonths", "Yearly"],
  Antiparasite: ["EveryNWeeks", "EveryNMonths", "Yearly"],
  Weighing: ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"],
  Activity: ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"],
  Bathing: ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"],
  Brushing: ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"],
  EarCleaning: ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"],
  NailTrimming: ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"],
  PawCare: ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"],
  TeethCleaning: ["Daily", "Weekly", "EveryNWeeks", "EveryNMonths"],
};
