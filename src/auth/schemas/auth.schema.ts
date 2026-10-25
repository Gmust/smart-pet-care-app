import type { TFunction } from "i18next";
import { z } from "zod/v4";

export const loginSchema = (t: TFunction<["auth"]>) =>
  z.object({
    email: z.email(t("auth:validation.emailInvalid")),
    password: z.string().min(1, t("auth:validation.passwordRequired")),
  });

export const registerSchema = (t: TFunction<["auth"]>) =>
  z
    .object({
      email: z.email(t("auth:validation.emailInvalid")),
      password: z.string().superRefine((value, ctx) => {
        const rules = value
          ? [
              { met: value.length >= 6, message: t("auth:validation.passwordMin") },
              { met: /[a-zA-Z]/.test(value), message: t("auth:validation.passwordNeedsLetter") },
              { met: /\d/.test(value), message: t("auth:validation.passwordNeedsDigit") },
              { met: /[\W_]/.test(value), message: t("auth:validation.passwordNeedsSpecial") },
            ]
          : [{ met: false, message: t("auth:validation.passwordRequired") }];
        for (const { met, message } of rules) {
          if (!met) ctx.addIssue({ code: "custom", message });
        }
      }),
      passwordConfirm: z.string(),
      termsAccepted: z.boolean().refine((accepted) => accepted, t("auth:validation.termsRequired")),
    })
    .refine((values) => values.password === values.passwordConfirm, {
      path: ["passwordConfirm"],
      message: t("auth:validation.passwordMismatch"),
    });
