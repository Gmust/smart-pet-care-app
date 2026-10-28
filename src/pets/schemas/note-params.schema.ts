import { z } from "zod";

export const noteParamsSchema = z.object({
  petId: z.uuid(),
  noteId: z.uuid().optional(),
  // Body for a new note, dictated by a voice command. Ignored when `noteId` opens an existing one.
  draft: z.string().optional().catch(undefined),
});
