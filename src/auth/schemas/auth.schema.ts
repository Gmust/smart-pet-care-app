import type { TFunction } from "i18next";
import { z } from "zod/v4";

// The server's password rules (`auth_password_too_short` / `_too_weak`), one message per unmet rule.
const newPassword = (t: TFunction<["auth"]>) =>
  z.string().superRefine((value, ctx) => {
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
  });

export const loginSchema = (t: TFunction<["auth"]>) =>
  z.object({
    email: z.email(t("auth:validation.emailInvalid")),
    password: z.string().min(1, t("auth:validation.passwordRequired")),
  });

export const registerSchema = (t: TFunction<["auth"]>) =>
  z
    .object({
      email: z.email(t("auth:validation.emailInvalid")),
      password: newPassword(t),
      passwordConfirm: z.string(),
      termsAccepted: z.boolean().refine((accepted) => accepted, t("auth:validation.termsRequired")),
    })
    .refine((values) => values.password === values.passwordConfirm, {
      path: ["passwordConfirm"],
      message: t("auth:validation.passwordMismatch"),
    });

export const forgotPasswordSchema = (t: TFunction<["auth"]>) =>
  z.object({
    email: z.email(t("auth:validation.emailInvalid")),
  });

export const resetPasswordSchema = (t: TFunction<["auth"]>) =>
  z
    .object({
      password: newPassword(t),
      passwordConfirm: z.string(),
    })
    .refine((values) => values.password === values.passwordConfirm, {
      path: ["passwordConfirm"],
      message: t("auth:validation.passwordMismatch"),
    });

// Route params are untrusted input: a repeated key (`?token=a&token=b`) arrives as `string[]`.
export const resetPasswordRouteParamsSchema = z.object({ token: z.string().trim().min(1) });

export const forgotPasswordRouteParamsSchema = z.object({ email: z.string() });
