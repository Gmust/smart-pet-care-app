import type { TFunction } from "i18next";
import { z } from "zod/v4";

const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/;

export const loginSchema = (t: TFunction<["auth"]>) =>
  z.object({
    email: z.email(t("auth:validation.emailInvalid")),
    password: z.string().min(1, t("auth:validation.passwordRequired")),
    passwordConfirm: z.string(),
  });

export const registerSchema = (t: TFunction<["auth"]>) =>
  z
    .object({
      email: z.email(t("auth:validation.emailInvalid")),
      password: z
        .string()
        .min(6, t("auth:validation.passwordMin"))
        .regex(PASSWORD_PATTERN, t("auth:validation.passwordPattern")),
      passwordConfirm: z.string(),
    })
    .refine((values) => values.password === values.passwordConfirm, {
      path: ["passwordConfirm"],
      message: t("auth:validation.passwordMismatch"),
    });
