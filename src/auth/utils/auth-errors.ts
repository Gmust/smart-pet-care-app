import type { ProblemDetails } from "@/api/generated";

import axios from "axios";

/**
 * Extracts a user-facing message from an API error. The backend returns
 * RFC7807 ProblemDetails on 400/401, so prefer `detail`, then `title`,
 * falling back to a caller-provided message.
 */
export const getProblemMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ProblemDetails>(error)) {
    const data = error.response?.data;
    if (data?.detail) {
      return data.detail;
    }
    if (data?.title) {
      return data.title;
    }
  }
  return fallback;
};
