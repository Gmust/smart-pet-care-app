import type { TFunction } from "i18next";

import { getApiError } from "@/common/utils/getApiError";

import wellnessEn from "../locales/en.json";

// A type guard, not an inline check: Object.hasOwn alone does not narrow `code`
// to a key the typed `t` accepts. The English locale doubles as the list of
// backend codes we translate, so supporting a new code is one line in en.json.
const isTranslatedCode = (code: unknown): code is keyof typeof wellnessEn.error.codes =>
  typeof code === "string" && Object.hasOwn(wellnessEn.error.codes, code);

/** Message for a failed evaluation request. Prefers the backend's `code` alias,
 * then the HTTP status, so raw server English never reaches the UI. */
export const getWellnessErrorMessage = (error: unknown, t: TFunction<["wellness"]>) => {
  const { status, code, params, retryAfterSeconds } = getApiError(error);

  if (isTranslatedCode(code)) {
    // Nested, never spread: top-level keys are i18next options (lng, ns,
    // defaultValue, returnObjects...), which the server must not control.
    // Strings reference them as {{params.name}}.
    return t(`wellness:error.codes.${code}`, { params, retryAfterSeconds });
  }

  if (status === 429) {
    return retryAfterSeconds
      ? t("wellness:error.rateLimitedRetryAfter", { seconds: retryAfterSeconds })
      : t("wellness:error.rateLimited");
  }
  if (status === 502 || status === 503) return t("wellness:error.unavailable");
  return t("wellness:error.description");
};
