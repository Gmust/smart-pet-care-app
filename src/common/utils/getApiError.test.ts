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
  it("narrows classifier errors and normalizes string retry delays", () => {
    expect(
      getApiError(
        axiosError(429, {
          messageId: "message-1",
          code: "rate_limit",
          message: "Wait",
          retryable: true,
          retryAfterSeconds: "12",
        })
      )
    ).toEqual({
      kind: "classifier",
      status: 429,
      code: "rate_limit",
      params: null,
      message: "Wait",
      messageId: "message-1",
      retryable: true,
      retryAfterSeconds: 12,
    });
  });

  it("narrows problem details", () => {
    const error = axiosError(404, { title: "Not found", detail: "Session missing" });
    expect(getApiError(error)).toMatchObject({
      kind: "problem",
      status: 404,
      code: null,
      message: "Session missing",
      retryable: false,
    });
  });

  it("keeps the code alias, params and retry delay of an ApiErrorResponse", () => {
    // The unified backend shape: no `retryable`, but `code` is what the UI
    // translates on — dropping it here would push every screen back to status codes.
    const error = axiosError(429, {
      code: "too_many_requests",
      message: "Slow down.",
      params: { limit: 5 },
      retryAfterSeconds: "30",
    });
    expect(getApiError(error)).toMatchObject({
      kind: "problem",
      status: 429,
      code: "too_many_requests",
      params: { limit: 5 },
      retryAfterSeconds: 30,
    });
  });

  it("treats non-Axios failures as retryable network errors", () => {
    expect(getApiError(new Error("offline"))).toMatchObject({
      kind: "network",
      status: null,
      message: "offline",
      retryable: true,
    });
  });
});
