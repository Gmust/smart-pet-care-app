import z from "zod/v4";

export const setNewAvatarSchema = z.object({
  file: z.object({
    uri: z.string(),
    mimeType: z.string().nullish(),
    fileName: z.string().nullish(),
  }),
});

export type TypeNewAvatarForm = z.infer<typeof setNewAvatarSchema>;
