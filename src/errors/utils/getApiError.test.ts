/// <reference types="jest" />

import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";

import { getApiError } from "./getApiError";

const axiosError = (status: number, data: unknown): AxiosError => {
  const headers = new AxiosHeaders();
  const config = { headers };
  const response: AxiosResponse = {
    data,
    status,
    statusText: "Failure",
    headers,
    config,
  };
  return new AxiosError("Request failed", undefined, config, undefined, response);
};

describe("getApiError", () => {
  it("reads every contract field and normalizes a string retry delay", () => {
    expect(
      getApiError(
        axiosError(503, {
          code: "service_unavailable",
          message: "Classifier unreachable.",
          params: { limit: 5 },
          traceId: "0HN7A2K9QJ3B4:00000012",
          retryable: true,
          retryAfterSeconds: "12",
          messageId: "message-1",
          errors: { Email: ["auth_email_invalid", 7], Broken: "not-a-list" },
        })
      )
    ).toEqual({
      status: 503,
      code: "service_unavailable",
      params: { limit: 5 },
      message: "Classifier unreachable.",
      messageId: "message-1",
      // Non-string aliases are dropped rather than rendered.
      fieldErrors: { Email: ["auth_email_invalid"], Broken: [] },
      retryable: true,
      retryAfterSeconds: 12,
    });
  });

  it("keeps the messageId of a chat failure that carries no retryable flag", () => {
    // The old parser only read messageId off classifier bodies, so a 409 marked
    // the wrong bubble as failed.
    const error = axiosError(409, {
      code: "chat_message_not_retryable",
      message: "Not retryable.",
      messageId: "message-2",
    });
    expect(getApiError(error)).toMatchObject({ messageId: "message-2", retryable: false });
  });

  it("never retries a 500: it is a bug and fails identically", () => {
    const error = axiosError(500, { code: "internal_error", message: "Unexpected." });
    expect(getApiError(error)).toMatchObject({ code: "internal_error", retryable: false });
  });

  it("treats 429 and 502+ as retryable when the server omits the flag", () => {
    expect(getApiError(axiosError(429, { code: "rate_limit_exceeded" })).retryable).toBe(true);
    expect(getApiError(axiosError(503, { code: "request_timeout" })).retryable).toBe(true);
    // A gateway's own page: no contract body at all.
    expect(getApiError(axiosError(502, "<html>Bad Gateway</html>")).retryable).toBe(true);
    expect(getApiError(axiosError(504, "<html>Gateway Timeout</html>")).retryable).toBe(true);
  });

  it("honours an explicit retryable: false on a dependency failure", () => {
    const error = axiosError(502, { code: "classifier_invalid_response", retryable: false });
    expect(getApiError(error).retryable).toBe(false);
  });

  it("treats non-Axios failures as retryable with no status", () => {
    expect(getApiError(new Error("offline"))).toMatchObject({
      status: null,
      code: null,
      retryable: true,
    });
  });
});
