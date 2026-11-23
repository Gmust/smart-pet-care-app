import type { TFunction } from "i18next";
import { z } from "zod/v4";

export const editProfileSchema = (t: TFunction<"profile">) =>
  z.object({
    displayName: z.string().trim().max(80, t("validation.displayNameTooLong")),
    // Empty clears the number; the submit maps "" to null.
    phoneNumber: z.string().refine((value) => value === "" || z.e164().safeParse(value).success, {
      error: t("validation.phoneNumberInvalid"),
    }),
    avatar: z
      .object({
        uri: z.string(),
        mimeType: z.string().nullish(),
        fileName: z.string().nullish(),
      })
      .nullable(),
  });

type EditProfileSchema = ReturnType<typeof editProfileSchema>;
export type EditProfileForm = z.infer<EditProfileSchema>;
