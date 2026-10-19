import { z } from "zod";

export const ASSESSMENT_TAB_KEYS = ["wellness", "feeding", "recommendations"] as const;
export type AssessmentTabKey = (typeof ASSESSMENT_TAB_KEYS)[number];

export const assessmentParamsSchema = z.object({
  petId: z.uuid(),
  from: z.enum(["home"]).optional().catch(undefined),
  // Which tab to open on. A deep link with an unknown tab still opens the screen.
  tab: z.enum(ASSESSMENT_TAB_KEYS).optional().catch(undefined),
});
