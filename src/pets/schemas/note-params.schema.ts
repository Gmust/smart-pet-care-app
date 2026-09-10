import { z } from "zod";

export const noteParamsSchema = z.object({
  petId: z.uuid(),
  noteId: z.uuid().optional(),
});
