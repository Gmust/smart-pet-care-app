import type { TFunction } from "i18next";
import { z } from "zod/v4";

const PHONE_PATTERN = /^[+()\d][\d\s().-]{5,}$/;

export const editProfileSchema = (t: TFunction<"profile">) =>
  z.object({
    displayName: z.string().trim().max(80, t("validation.displayNameTooLong")),
    phoneNumber: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || PHONE_PATTERN.test(value),
        t("validation.phoneNumberInvalid")
      ),
  });

type EditProfileSchema = ReturnType<typeof editProfileSchema>;
export type EditProfileForm = z.infer<EditProfileSchema>;
