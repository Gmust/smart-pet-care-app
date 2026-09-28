import axios from "axios";
import i18next from "i18next";

import errorsEn from "../locales/en.json";

import { getApiError } from "./getApiError";

// A type guard, not an inline check: Object.hasOwn alone does not narrow `code`
// to a key the typed `t` accepts. The English locale doubles as the list of
// backend aliases we translate, so supporting a new code is one line in en.json.
const isTranslatedCode = (code: string | null): code is keyof typeof errorsEn.codes =>
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

  const { status, code, params, message, retryAfterSeconds } = getApiError(error);

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
  if (status === 502 || status === 503) return i18next.t("errors:unavailable");

  return message ?? fallback;
};
