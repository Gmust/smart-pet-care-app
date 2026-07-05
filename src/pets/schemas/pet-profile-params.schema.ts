import { z } from "zod";

export const petProfileParamsSchema = z.object({
  petId: z.uuid(),
});
