import type { ComponentType } from "react";
import type { SvgProps } from "react-native-svg";

import { ActivityIcon } from "@/icons/activity";
import { BathIcon } from "@/icons/bath";
import { BrushCleaningIcon } from "@/icons/brush-cleaning";
import { BugOffIcon } from "@/icons/bug-off";
import { CandyOffIcon } from "@/icons/candy-off";
import { EarIcon } from "@/icons/ear";
import { PawPrintIcon } from "@/icons/paw-print";
import { ScaleIcon } from "@/icons/scale";
import { ScissorsIcon } from "@/icons/scissors";
import { StethoscopeIcon } from "@/icons/stethoscope";
import { SyringeIcon } from "@/icons/syringe";
import { WormIcon } from "@/icons/worm";

import type { CareCategory } from "../../types";

type IconComponent = ComponentType<SvgProps>;

const CARE_CATEGORY_ICONS: Record<CareCategory, IconComponent> = {
  VetVisit: StethoscopeIcon,
  Weighing: ScaleIcon,
  Activity: ActivityIcon,
  Bathing: BathIcon,
  Brushing: BrushCleaningIcon,
  EarCleaning: EarIcon,
  NailTrimming: ScissorsIcon,
  PawCare: PawPrintIcon,
  TeethCleaning: CandyOffIcon,
  Vaccination: SyringeIcon,
  Deworming: WormIcon,
  Antiparasite: BugOffIcon,
};

type Props = SvgProps & { category: CareCategory };

export function CareCategoryIcon({ category, ...svgProps }: Props) {
  const Icon = CARE_CATEGORY_ICONS[category];
  return <Icon {...svgProps} />;
}
