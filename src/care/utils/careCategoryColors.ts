import { palette } from "@/styles/palette";

import type { CareCategory, PlannedHealthEventCategory } from "../types";

type CategoryColors = { background: string; iconColor: string };

const PEACH: CategoryColors = {
  background: palette.brand.peachIconBg,
  iconColor: palette.brand.peachDefault,
};

const GROOMING: CategoryColors = {
  background: palette.brand.surfaceSunken,
  iconColor: palette.brand.textBody,
};

const CATEGORY_COLORS: Record<CareCategory | PlannedHealthEventCategory, CategoryColors> = {
  VetVisit: PEACH,
  Vaccination: PEACH,
  Deworming: PEACH,
  Antiparasite: PEACH,
  Weighing: { background: palette.brand.dangerBg, iconColor: palette.brand.peachDefault },
  Walking: { background: palette.brand.primaryXsoft, iconColor: palette.brand.textBody },
  Bathing: GROOMING,
  Brushing: GROOMING,
  EarCleaning: GROOMING,
  NailTrimming: GROOMING,
  PawCare: GROOMING,
  TeethCleaning: GROOMING,
};

export const getCareCategoryColors = (
  category: CareCategory | PlannedHealthEventCategory
): CategoryColors => CATEGORY_COLORS[category];
