import { AxiosError, AxiosHeaders } from "axios";

import i18n from "@/i18n";

import errorsEn from "../locales/en.json";

import { getApiErrorMessage } from "./getApiErrorMessage";

const t = i18n.getFixedT(null, ["errors", "common"]);

const apiFailure = (status: number, data: unknown) => {
  const error = new AxiosError("request failed", "ERR_BAD_REQUEST");
  error.response = {
    data,
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
};

describe("getApiErrorMessage", () => {
  it("translates a known alias and interpolates its params", () => {
    const message = getApiErrorMessage(
      apiFailure(400, {
        code: "pet_photo_too_large",
        message: "File exceeds 5 MB.",
        params: { maxMegabytes: 5 },
      })
    );

    expect(message).toBe("Photo is too large. The limit is 5 MB.");
  });

  it("does not let server params act as i18next options", () => {
    // Spread at the top level, `returnDetails` makes t() return an object
    // instead of a string, and `lng` would switch the language.
    const message = getApiErrorMessage(
      apiFailure(400, {
        code: "request_validation_failed",
        params: { returnDetails: true, lng: "de", defaultValue: "injected" },
      })
    );

    expect(message).toBe(t("errors:codes.request_validation_failed"));
  });

  it("keeps the screaming-case confirmation aliases distinct", () => {
    const message = getApiErrorMessage(apiFailure(410, { code: "CONFIRMATION_CODE_EXPIRED" }));

    expect(message).toBe(t("errors:codes.CONFIRMATION_CODE_EXPIRED"));
  });

  it("falls back to the server's English for an alias this build does not know", () => {
    const message = getApiErrorMessage(
      apiFailure(400, { code: "some_new_code", message: "Raw server text" })
    );

    expect(message).toBe("Raw server text");
  });

  it("uses the status, not server English, for an unknown code on 503", () => {
    // The classifier invents codes at runtime on 429/503; its text is not ours.
    const message = getApiErrorMessage(
      apiFailure(503, { code: "service_overloaded", message: "Raw server text" })
    );

    expect(message).toBe(t("errors:unavailable"));
  });

  it("reads a gateway timeout with no contract body as unavailable", () => {
    expect(getApiErrorMessage(apiFailure(504, "<html>Gateway Timeout</html>"))).toBe(
      t("errors:unavailable")
    );
  });

  it("names the failed rule of a field the form may not even show", () => {
    // The reminder form has no time-zone input; the generic "some details
    // aren't valid" would leave the user nothing to act on.
    const message = getApiErrorMessage(
      apiFailure(400, {
        code: "request_validation_failed",
        errors: { UtcOffsetMinutes: ["reminder_utc_offset_required"] },
      })
    );

    expect(message).toBe(t("errors:codes.reminder_utc_offset_required"));
  });

  it("shows the retry delay on 429, even when it arrives as a string", () => {
    const message = getApiErrorMessage(apiFailure(429, { retryAfterSeconds: "12" }));

    expect(message).toBe("Too many requests. Try again in 12 seconds.");
  });

  it("omits the delay on 429 when the server gives none", () => {
    const message = getApiErrorMessage(apiFailure(429, { retryAfterSeconds: null }));

    expect(message).toBe(t("errors:rateLimited"));
  });

  it("asks to check the connection when no response arrived", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK");

    expect(getApiErrorMessage(error)).toBe(t("errors:network"));
  });

  it("uses the caller's fallback for a failure that never reached the API", () => {
    expect(getApiErrorMessage(new Error("DEVELOPER_ERROR"), "Google failed")).toBe("Google failed");
    expect(getApiErrorMessage(new Error("boom"))).toBe(t("common:errors.somethingWentWrong"));
  });
});

// The field-level aliases from the error contract. They arrive as bare strings
// inside `errors`, never with `params`.
const FIELD_ALIASES = [
  "auth_email_required",
  "auth_email_invalid",
  "auth_password_required",
  "auth_password_too_short",
  "auth_password_too_weak",
  "auth_password_confirm_required",
  "auth_passwords_do_not_match",
  "auth_terms_not_accepted",
  "auth_confirmation_code_required",
  "auth_confirmation_code_malformed",
  "chat_pet_id_required",
  "chat_client_message_id_required",
  "chat_message_text_required",
  "chat_message_text_too_long",
  "pet_species_required",
  "reminder_utc_offset_required",
];

describe("field alias copy", () => {
  it("never needs params, because field aliases arrive without them", () => {
    // Otherwise the form shows "Use {{params.maxLength}} characters" verbatim.
    const needingParams = Object.entries(errorsEn.codes)
      .filter(([alias, text]) => FIELD_ALIASES.includes(alias) && text.includes("{{"))
      .map(([alias]) => alias);

    expect(needingParams).toEqual([]);
  });
});
