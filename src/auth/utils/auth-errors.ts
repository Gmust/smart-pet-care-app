import axios from "axios";

interface ApiErrorData {
  message?: string;
}

/**
 * Extracts a user-facing message from an API error. The backend returns
 * `{ message }` (e.g. "Email is already taken"); falls back to a
 * caller-provided message.
 */
export const getProblemMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorData>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
};
