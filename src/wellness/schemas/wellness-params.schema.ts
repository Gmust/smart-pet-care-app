import { z } from "zod";

export const wellnessParamsSchema = z.object({
  petId: z.uuid(),
});
