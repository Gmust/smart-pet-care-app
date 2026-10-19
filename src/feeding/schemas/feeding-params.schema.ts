import { z } from "zod";

export const feedingParamsSchema = z.object({
  petId: z.uuid(),
});
