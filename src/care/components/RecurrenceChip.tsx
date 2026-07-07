import { useTranslation } from "react-i18next";

import { Chip } from "@/shadecn/ui/chip";

import type { DayOfWeek, RecurrenceType } from "../types";
import { WEEK_DAYS } from "../types";

type Props = {
  recurrenceType: RecurrenceType;
  intervalN?: number;
  weekDays?: DayOfWeek[];
  /**
   * "days" (default) lists the selected week days, e.g. "Thu · Sat" — used
   * by Walking/Weighing/Vaccination, where the days ARE the information.
   * "compact" collapses "Weekly" to a static "By week days" label instead —
   * used by Meals, where the chip sits under a whole row and per-day detail
   * would be noisy (see MealRow, shipping in step 4).
   */
  variant?: "days" | "compact";
};

export function RecurrenceChip({ recurrenceType, intervalN, weekDays, variant = "days" }: Props) {
  const { t } = useTranslation(["care"]);

  let label: string;
  switch (recurrenceType) {
    case "Daily":
      label = t("recurrence.daily");
      break;
    case "Weekly":
      label =
        variant === "compact" || !weekDays?.length
          ? t("recurrence.byWeekDays")
          : [...weekDays]
              .sort((a, b) => WEEK_DAYS.indexOf(a) - WEEK_DAYS.indexOf(b))
              .map((day) => t(`daysShort.${day}`))
              .join(" · ");
      break;
    case "EveryNWeeks":
      label =
        intervalN && intervalN > 1
          ? t("recurrence.everyNWeeks", { n: intervalN })
          : t("recurrence.everyWeek");
      break;
    case "EveryNMonths":
      label =
        intervalN && intervalN > 1
          ? t("recurrence.everyNMonths", { n: intervalN })
          : t("recurrence.everyMonth");
      break;
  }

  return <Chip label={label} tone="neutral" variant="ghost" size="sm" />;
}
