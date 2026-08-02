import { palette } from "@/styles/palette";

import type { CareCategory } from "../types";

type CategoryColors = { background: string; iconColor: string };

const PEACH: CategoryColors = {
  background: palette.brand.peachIconBg,
  iconColor: palette.brand.peachDefault,
};

const GROOMING: CategoryColors = {
  background: palette.brand.surfaceSunken,
  iconColor: palette.brand.textBody,
};

const CATEGORY_COLORS: Record<CareCategory, CategoryColors> = {
  VetVisit: PEACH,
  Vaccination: PEACH,
  Deworming: PEACH,
  Antiparasite: PEACH,
  Weighing: { background: palette.brand.dangerBg, iconColor: palette.brand.peachDefault },
  Activity: { background: palette.brand.primaryXsoft, iconColor: palette.brand.textBody },
  Bathing: GROOMING,
  Brushing: GROOMING,
  EarCleaning: GROOMING,
  NailTrimming: GROOMING,
  PawCare: GROOMING,
  TeethCleaning: GROOMING,
};

export const getCareCategoryColors = (category: CareCategory): CategoryColors =>
  CATEGORY_COLORS[category];
