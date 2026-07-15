import type { TFunction } from "i18next";
import { z } from "zod/v4";

const CODE_PATTERN = /^\d{6}$/;

export const confirmEmailSchema = (t: TFunction<["auth"]>) =>
  z.object({
    code: z.string().trim().regex(CODE_PATTERN, t("auth:validation.codeInvalid")),
  });
