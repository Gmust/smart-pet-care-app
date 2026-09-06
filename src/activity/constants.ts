import { ActivityIntensity, ActivityType } from "@/api/generated";
import { ActivityIcon } from "@/icons/activity";
import { FishSymbolIcon } from "@/icons/fish-symbol";
import { HandHelpingIcon } from "@/icons/hand-helping";
import type { Icon } from "@/icons/icons";
import { LayoutListIcon } from "@/icons/layout-list";
import { PawPrintIcon } from "@/icons/paw-print";
import { TrendingUpIcon } from "@/icons/trending";

/** Order the type chips render in, across the create drawer and the filter drawer. */
export const ACTIVITY_TYPES: ActivityType[] = [
  ActivityType.Walk,
  ActivityType.Play,
  ActivityType.Training,
  ActivityType.Swimming,
  ActivityType.Run,
  ActivityType.Other,
];

export const ACTIVITY_INTENSITIES: ActivityIntensity[] = [
  ActivityIntensity.Low,
  ActivityIntensity.Moderate,
  ActivityIntensity.High,
];

export const ACTIVITY_TYPE_ICON: Record<ActivityType, Icon> = {
  Walk: PawPrintIcon,
  Play: HandHelpingIcon,
  Training: TrendingUpIcon,
  Swimming: FishSymbolIcon,
  Run: ActivityIcon,
  Other: LayoutListIcon,
};

/**
 * Default list window. Type and intensity filtering happens client-side over
 * whatever this range returns, so the range has to stay bounded — see
 * design.md decision 5.
 */
export const DEFAULT_RANGE_DAYS = 30;
