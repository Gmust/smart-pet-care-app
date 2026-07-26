import { palette } from "@/styles/palette";

import type { CareCategory, PlannedHealthEventCategory } from "../types";

type CategoryColors = { background: string; iconColor: string };

const DEFAULT_COLORS: CategoryColors = {
  background: palette.brand.peachIconBg,
  iconColor: palette.brand.peachDefault,
};

const GROOMING_COLORS: CategoryColors = {
  background: palette.brand.surfaceSunken,
  iconColor: palette.brand.textBody,
};

const GROOMING_CATEGORIES: CareCategory[] = [
  "Bathing",
  "Brushing",
  "EarCleaning",
  "NailTrimming",
  "PawCare",
  "TeethCleaning",
];

const OVERRIDES: Partial<Record<CareCategory, CategoryColors>> = {
  Weighing: { background: palette.brand.dangerBg, iconColor: palette.brand.peachDefault },
  Walking: { background: palette.brand.primaryXsoft, iconColor: palette.brand.textBody },
  ...Object.fromEntries(GROOMING_CATEGORIES.map((category) => [category, GROOMING_COLORS])),
};

export function getCareCategoryColors(
  category: CareCategory | PlannedHealthEventCategory
): CategoryColors {
  return OVERRIDES[category as CareCategory] ?? DEFAULT_COLORS;
}
