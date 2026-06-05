import i18n from "@/i18n";

import { z } from "zod";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;

export interface AuthFormValues {
  email: string;
  password: string;
  passwordConfirm: string;
}

export const loginSchema: z.ZodType<AuthFormValues> = z.object({
  email: z.string().regex(EMAIL_PATTERN, i18n.t("auth:validation.emailInvalid")),
  password: z.string().min(1, i18n.t("auth:validation.passwordRequired")),
  passwordConfirm: z.string(),
});

export const registerSchema: z.ZodType<AuthFormValues> = z
  .object({
    email: z.string().regex(EMAIL_PATTERN, i18n.t("auth:validation.emailInvalid")),
    password: z
      .string()
      .min(6, i18n.t("auth:validation.passwordMin"))
      .regex(PASSWORD_PATTERN, i18n.t("auth:validation.passwordPattern")),
    passwordConfirm: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ["passwordConfirm"],
    message: i18n.t("auth:validation.passwordMismatch"),
  });
