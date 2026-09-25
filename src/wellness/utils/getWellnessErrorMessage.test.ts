import { AxiosError, AxiosHeaders } from "axios";

import i18n from "@/i18n";

import { getWellnessErrorMessage } from "./getWellnessErrorMessage";

const t = i18n.getFixedT(null, ["wellness"]);

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

describe("getWellnessErrorMessage", () => {
  it("translates a known backend code alias before looking at the status", () => {
    const message = getWellnessErrorMessage(
      apiFailure(400, { code: "request_validation_failed", message: "Request validation failed." }),
      t
    );

    expect(message).toBe(t("wellness:error.codes.request_validation_failed"));
  });

  it("does not let server params act as i18next options", () => {
    // Spread at the top level, `returnDetails` makes t() return an object
    // instead of a string, and `lng` would switch the language.
    const message = getWellnessErrorMessage(
      apiFailure(400, {
        code: "request_validation_failed",
        params: { returnDetails: true, lng: "de", defaultValue: "injected" },
      }),
      t
    );

    expect(message).toBe(t("wellness:error.codes.request_validation_failed"));
  });

  it("falls back to the status for an unknown code and never shows server English", () => {
    const message = getWellnessErrorMessage(
      apiFailure(503, { code: "some_new_code", message: "Raw server text" }),
      t
    );

    expect(message).toBe(t("wellness:error.unavailable"));
  });

  it("shows the retry delay on 429, even when it arrives as a string", () => {
    const message = getWellnessErrorMessage(apiFailure(429, { retryAfterSeconds: "12" }), t);

    expect(message).toBe("Too many requests. Try again in 12 seconds.");
  });

  it("omits the delay on 429 when the server gives none", () => {
    const message = getWellnessErrorMessage(apiFailure(429, { retryAfterSeconds: null }), t);

    expect(message).toBe(t("wellness:error.rateLimited"));
  });

  it("uses the generic message for a network failure", () => {
    expect(getWellnessErrorMessage(new Error("Network Error"), t)).toBe(
      t("wellness:error.description")
    );
  });
});
