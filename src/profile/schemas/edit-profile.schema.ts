import type { TFunction } from "i18next";
import { z } from "zod/v4";

export const editProfileSchema = (t: TFunction<"profile">) =>
  z.object({
    displayName: z.string().trim().max(80, t("validation.displayNameTooLong")),
    phoneNumber: z.e164({ error: t("validation.phoneNumberInvalid") }),
  });

type EditProfileSchema = ReturnType<typeof editProfileSchema>;
export type EditProfileForm = z.infer<EditProfileSchema>;
