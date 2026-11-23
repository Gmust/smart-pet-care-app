import { z } from "zod/v4";

import { optionalTextList } from "./create-pet.schema";

export const editBasicsSchema = z.object({
  allergies: optionalTextList,
  chronicConditions: optionalTextList,
  behavioralNotes: optionalTextList,
});

export type EditBasicsForm = z.input<typeof editBasicsSchema>;
