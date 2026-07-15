/// <reference types="jest" />

import { getAssistantApiError, isAssistantNotFoundError } from "./assistantErrors";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";

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

describe("assistant API error guards", () => {
  it("narrows classifier errors and normalizes string retry delays", () => {
    expect(
      getAssistantApiError(
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
      message: "Wait",
      messageId: "message-1",
      retryable: true,
      retryAfterSeconds: 12,
    });
  });

  it("narrows problem details and detects not-found responses", () => {
    const error = axiosError(404, { title: "Not found", detail: "Session missing" });
    expect(getAssistantApiError(error)).toMatchObject({
      kind: "problem",
      status: 404,
      message: "Session missing",
      retryable: false,
    });
    expect(isAssistantNotFoundError(error)).toBe(true);
  });

  it("treats non-Axios failures as retryable network errors", () => {
    expect(getAssistantApiError(new Error("offline"))).toMatchObject({
      kind: "network",
      status: null,
      message: "offline",
      retryable: true,
    });
  });
});
