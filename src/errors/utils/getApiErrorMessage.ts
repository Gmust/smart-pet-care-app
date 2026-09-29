import axios from "axios";
import i18next from "i18next";

import errorsEn from "../locales/en.json";

import { getApiError } from "./getApiError";

// A type guard, not an inline check: Object.hasOwn alone does not narrow `code`
// to a key the typed `t` accepts. The English locale doubles as the list of
// backend aliases we translate, so supporting a new code is one line in en.json.
export const isTranslatedCode = (code: string | null): code is keyof typeof errorsEn.codes =>
  code !== null && Object.hasOwn(errorsEn.codes, code);

/** User-facing text for a failed request: the translated `code`, then a
 * status-level message for transient failures, then the server's English
 * `message` for an alias this build does not know yet. `fallback` covers
 * failures that never reached the API (e.g. a native SDK error). */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = i18next.t("common:errors.somethingWentWrong")
): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const { status, code, params, message, retryAfterSeconds, fieldErrors } = getApiError(error);

  // A validation failure names its rule per field. The first translated one
  // says more than "some details aren't valid", and reaches the user even when
  // the form has no input for that field.
  const fieldAlias = Object.values(fieldErrors).flat().find(isTranslatedCode);
  if (fieldAlias) return i18next.t(`errors:codes.${fieldAlias}`);

  if (isTranslatedCode(code)) {
    // Nested, never spread: top-level keys are i18next options (lng, ns,
    // defaultValue, returnObjects...), which the server must not control.
    // Strings reference them as {{params.name}}.
    return i18next.t(`errors:codes.${code}`, { params, retryAfterSeconds });
  }

  if (status === null) return i18next.t("errors:network");

  // Transient aliases (wellness_service_*, service_unavailable, the classifier's
  // runtime codes) are deliberately absent from `codes`: the classifier invents
  // new ones on 429/503, and these branches can show the retry delay.
  if (status === 429) {
    return retryAfterSeconds
      ? i18next.t("errors:rateLimitedRetryAfter", { seconds: retryAfterSeconds })
      : i18next.t("errors:rateLimited");
  }
  if (status >= 502) return i18next.t("errors:unavailable");

  return message ?? fallback;
};
