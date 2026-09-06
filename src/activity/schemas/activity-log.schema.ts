import type { TFunction } from "i18next";
import { z } from "zod";

import { ActivityIntensity, ActivityType } from "@/api/generated";

const ACTIVITY_TYPE_VALUES = Object.values(ActivityType);
const ACTIVITY_INTENSITY_VALUES = Object.values(ActivityIntensity);

export type ActivityFormValues = {
  /** "" stands for "not chosen yet" so the field Input type matches the schema. */
  type: ActivityType | "";
  recordedAt: string;
  intensity: ActivityIntensity | "";
  /** Numeric fields are held as strings — RN text inputs produce strings, and the
   *  DTO accepts `null | number | string`. Converted at submit. */
  durationMinutes: string;
  steps: string;
  locationLabel: string;
  note: string;
};

/** Blank is allowed (the field is optional); a present value must be a whole, non-negative number. */
const optionalWholeNumber = (message: string) =>
  z.string().refine((value) => {
    if (value.trim() === "") return true;
    return /^\d+$/.test(value.trim());
  }, message);

type Options = {
  /**
   * Editing requires an intensity. The API's PatchFieldOfActivityIntensity has
   * no null member, so an intensity that is already set cannot be cleared —
   * requiring one keeps the form from offering a change it cannot persist.
   */
  requireIntensity?: boolean;
};

export const activityLogSchema = (
  t: TFunction<["activity", "common"]>,
  { requireIntensity = false }: Options = {}
) =>
  z.object({
    type: z.union([z.literal(""), z.enum(ACTIVITY_TYPE_VALUES)]).refine((value) => value !== "", {
      message: t("activity:forms.activity.errors.typeRequired"),
    }),
    recordedAt: z
      .string()
      .min(1, t("activity:forms.activity.errors.recordedAtRequired"))
      .refine((value) => !value || new Date(value).getTime() <= Date.now(), {
        message: t("activity:forms.activity.errors.recordedAtFuture"),
      }),
    intensity: z
      .union([z.literal(""), z.enum(ACTIVITY_INTENSITY_VALUES)])
      .refine((value) => !requireIntensity || value !== "", {
        message: t("activity:forms.activity.errors.intensityRequired"),
      }),
    durationMinutes: optionalWholeNumber(t("activity:forms.activity.errors.durationInvalid")),
    steps: optionalWholeNumber(t("activity:forms.activity.errors.stepsInvalid")),
    locationLabel: z.string(),
    note: z.string(),
  });
