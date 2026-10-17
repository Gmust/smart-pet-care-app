import { z } from "zod";

export const PROFILE_TAB_KEYS = ["overview", "health", "care", "reminders"] as const;
export type ProfileTabKey = (typeof PROFILE_TAB_KEYS)[number];

export const petProfileParamsSchema = z.object({
  petId: z.uuid(),
  from: z.enum(["home"]).optional().catch(undefined),
  // Which tab to open on. A deep link with an unknown tab still opens the profile.
  tab: z.enum(PROFILE_TAB_KEYS).optional().catch(undefined),
});
