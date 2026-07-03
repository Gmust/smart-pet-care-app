/**
 * TODO(icons): dedicated icons for Grooming sub-categories (Bathing, Brushing,
 * EarCleaning, NailTrimming, PawCare, TeethCleaning) and FoodTracker don't
 * exist in src/icons yet — placeholders below until they're designed.
 */
import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import { ActivityIcon } from "@/icons/activity";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { TriangleAlertIcon } from "@/icons/triangle-alert";
import { UtensilsIcon } from "@/icons/utensils";
import { WeightIcon } from "@/icons/weight";

import type { CareCategory, PlannedHealthEventCategory } from "../../types";

type IconComponent = ComponentType<SvgProps>;

/** Used for every category that doesn't have a dedicated icon yet. */
const PLACEHOLDER_ICON: IconComponent = TriangleAlertIcon;

const CARE_CATEGORY_ICONS: Record<CareCategory, IconComponent> = {
  VetVisit: StethoscopeIcon,
  Weighing: WeightIcon,
  Walking: ActivityIcon,
  Bathing: PLACEHOLDER_ICON, // TODO(icons): needs a dedicated grooming icon
  Brushing: PLACEHOLDER_ICON, // TODO(icons): needs a dedicated grooming icon
  EarCleaning: PLACEHOLDER_ICON, // TODO(icons): needs a dedicated grooming icon
  NailTrimming: PLACEHOLDER_ICON, // TODO(icons): needs a dedicated grooming icon
  PawCare: PLACEHOLDER_ICON, // TODO(icons): needs a dedicated grooming icon
  TeethCleaning: PLACEHOLDER_ICON, // TODO(icons): needs a dedicated grooming icon
};

const PLANNED_HEALTH_EVENT_ICONS: Record<PlannedHealthEventCategory, IconComponent> = {
  Vaccination: SyringeIcon,
  Deworming: PLACEHOLDER_ICON, // TODO(icons): needs a dedicated treatment icon
  Antiparasite: PLACEHOLDER_ICON, // TODO(icons): needs a dedicated treatment icon
};

export const FOOD_TRACKER_ICON: IconComponent = UtensilsIcon; // TODO(icons): confirm this fits, or design a bag/bowl icon

type Props = SvgProps & { category: CareCategory | PlannedHealthEventCategory };

export function CareCategoryIcon({ category, ...svgProps }: Props) {
  const Icon =
    CARE_CATEGORY_ICONS[category as CareCategory] ??
    PLANNED_HEALTH_EVENT_ICONS[category as PlannedHealthEventCategory] ??
    PLACEHOLDER_ICON;

  return <Icon {...svgProps} />;
}
