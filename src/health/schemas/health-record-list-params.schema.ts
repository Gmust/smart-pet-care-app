import { z } from "zod";

import { HEALTH_FORM_CATEGORIES } from "../constants";

/** Shared by the record form schema and the edit drawer, which uses it to
 * narrow a backend `HealthRecordType` (Medication, Surgery, ...) to the subset
 * this form can actually edit — without an `as` cast. */
export const formCategorySchema = z.enum(HEALTH_FORM_CATEGORIES);

export const healthRecordListParamsSchema = z.object({
  petId: z.uuid(),
  type: formCategorySchema,
});

export type HealthRecordListParams = z.infer<typeof healthRecordListParamsSchema>;
