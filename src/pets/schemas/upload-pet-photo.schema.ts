import z from "zod/v4";

export const uploadPetPhotoSchema = z.object({
  file: z.object({
    uri: z.string(),
    mimeType: z.string().nullish(),
    fileName: z.string().nullish(),
  }),
});

export type TypeUploadPetPhotoForm = z.infer<typeof uploadPetPhotoSchema>;
