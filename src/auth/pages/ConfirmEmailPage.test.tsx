/// <reference types="jest" />

import type { ReactNode } from "react";
import Toast from "react-native-toast-message";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import ConfirmEmailPage from "./ConfirmEmailPage";

const mockTranslate = (key: string) => key;
const mockRouter = { replace: jest.fn(), push: jest.fn() };
const mockConfirm = jest.fn();
const mockResend = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

// getApiErrorMessage translates through the global instance, not the hook.
jest.mock("i18next", () => ({
  __esModule: true,
  default: { t: (key: string) => mockTranslate(key) },
}));

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ email: "milo@example.com" }),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

jest.mock("../queries/useConfirmEmailMutation", () => ({
  useConfirmEmailMutation: () => ({ mutateAsync: mockConfirm }),
}));

jest.mock("../queries/useResendConfirmationMutation", () => ({
  useResendConfirmationMutation: () => ({ mutateAsync: mockResend, isPending: false }),
}));

const toastMock = jest.mocked(Toast.show);

const apiFailure = (status: number, code: string) => {
  const error = new AxiosError("Request failed", "ERR_BAD_REQUEST");
  error.response = {
    data: { code, message: code, traceId: "trace" },
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
};

const signIn = { pathname: "/(auth)/sign-in", params: { mode: "login" } };

const submitCode = (code: string) => {
  const utils = render(<ConfirmEmailPage />);
  fireEvent.changeText(utils.getByPlaceholderText("auth:confirmEmail.codePlaceholder"), code);
  fireEvent.press(utils.getByText("auth:confirmEmail.submit"));
  return utils;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ConfirmEmailPage", () => {
  it("treats an address that is already confirmed as done and moves on to sign-in", async () => {
    mockConfirm.mockImplementation(() =>
      Promise.reject(apiFailure(409, "EMAIL_ALREADY_CONFIRMED"))
    );
    submitCode("123456");

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith(signIn));
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success", text1: "errors:codes.EMAIL_ALREADY_CONFIRMED" })
    );
  });

  it.each([
    [410, "CONFIRMATION_CODE_EXPIRED"],
    [429, "CONFIRMATION_TOO_MANY_ATTEMPTS"],
  ])("clears a dead code (%s %s) so the next step is a new one", async (status, code) => {
    mockConfirm.mockImplementation(() => Promise.reject(apiFailure(status, code)));
    const utils = submitCode("123456");

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({ type: "error", text1: `errors:codes.${code}` })
    );
    expect(utils.getByPlaceholderText("auth:confirmEmail.codePlaceholder").props.value).toBe("");
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("keeps a mistyped code in place for correction", async () => {
    mockConfirm.mockImplementation(() =>
      Promise.reject(apiFailure(400, "CONFIRMATION_CODE_INVALID"))
    );
    const utils = submitCode("123456");

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        type: "error",
        text1: "errors:codes.CONFIRMATION_CODE_INVALID",
      })
    );
    expect(utils.getByPlaceholderText("auth:confirmEmail.codePlaceholder").props.value).toBe(
      "123456"
    );
  });

  it("moves on to sign-in when a resend finds the address already confirmed", async () => {
    mockResend.mockImplementation(() => Promise.reject(apiFailure(409, "EMAIL_ALREADY_CONFIRMED")));
    const utils = render(<ConfirmEmailPage />);
    fireEvent.press(utils.getByText("auth:confirmEmail.resend"));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith(signIn));
  });
});
