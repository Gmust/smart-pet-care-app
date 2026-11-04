/// <reference types="jest" />

import type { ReactNode } from "react";
import Toast from "react-native-toast-message";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import ResetPasswordPage from "./ResetPasswordPage";

const mockTranslate = (key: string) => key;
const mockRouter = { replace: jest.fn(), push: jest.fn(), dismissTo: jest.fn() };
const mockResetPassword = jest.fn();
const mockSignOut = jest.fn();
let mockParams: Record<string, unknown> = {};
let mockStatus: "loading" | "authenticated" | "unauthenticated" = "unauthenticated";

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
  useLocalSearchParams: () => mockParams,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

jest.mock("../queries/useResetPasswordMutation", () => ({
  useResetPasswordMutation: () => ({ mutateAsync: mockResetPassword }),
}));

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ status: mockStatus, signOut: mockSignOut }),
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

const submitPassword = (password: string) => {
  const utils = render(<ResetPasswordPage />);
  fireEvent.changeText(utils.getByPlaceholderText("auth:fields.newPasswordPlaceholder"), password);
  fireEvent.changeText(
    utils.getByPlaceholderText("auth:fields.passwordConfirmPlaceholder"),
    password
  );
  fireEvent.press(utils.getByText("auth:resetPassword.submit"));
  return utils;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { token: "link-token" };
  mockStatus = "unauthenticated";
  mockResetPassword.mockImplementation(() => Promise.resolve());
  mockSignOut.mockImplementation(() => Promise.resolve());
});

describe("ResetPasswordPage", () => {
  it("posts the link's token with the new password, then sends the user to sign in", async () => {
    const { getByText } = submitPassword("New-pass1!");
    expect(getByText("auth:resetPassword.backToSignIn")).toBeTruthy();

    await waitFor(() => expect(mockRouter.dismissTo).toHaveBeenCalledWith("/(auth)/sign-in"));
    expect(mockResetPassword).toHaveBeenCalledWith({
      token: "link-token",
      password: "New-pass1!",
      passwordConfirm: "New-pass1!",
    });
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success", text1: "auth:success.passwordResetTitle" })
    );
  });

  // The link may belong to another account; a reset of this one ends the session on refresh.
  it("leaves a signed-in device signed in and takes it back to the open app", async () => {
    mockStatus = "authenticated";
    const { queryByText } = submitPassword("New-pass1!");

    await waitFor(() => expect(mockRouter.dismissTo).toHaveBeenCalledWith("/(tabs)/home"));
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(queryByText("auth:resetPassword.backToSignIn")).toBeNull();
  });

  it("offers no way to sign-in while the session is still loading", () => {
    mockStatus = "loading";
    const { queryByText } = render(<ResetPasswordPage />);

    expect(queryByText("auth:resetPassword.backToSignIn")).toBeNull();
  });

  // A cold start from the App Link restores the session; until it settles, a submit would pick
  // sign-in and stack it on top of a session that is about to be live.
  it("does not submit while the session is still loading", async () => {
    mockStatus = "loading";
    submitPassword("New-pass1!");

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(mockRouter.dismissTo).not.toHaveBeenCalled();
  });

  it.each([
    [400, "auth_reset_token_invalid"],
    [410, "auth_reset_token_expired"],
  ])("sends a dead link (%i %s) back to Forgot password", async (status, code) => {
    mockResetPassword.mockImplementation(() => Promise.reject(apiFailure(status, code)));
    submitPassword("New-pass1!");

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/forgot-password"));
    expect(toastMock).toHaveBeenCalledWith({ type: "error", text1: `errors:codes.${code}` });
    expect(mockRouter.dismissTo).not.toHaveBeenCalled();
  });

  it("keeps the user on the form for any other failure", async () => {
    mockResetPassword.mockImplementation(() =>
      Promise.reject(apiFailure(400, "request_validation_failed"))
    );
    submitPassword("New-pass1!");

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockRouter.dismissTo).not.toHaveBeenCalled();
  });

  it.each([[undefined], [" "], [["a", "b"]]])(
    "shows a dead-link state instead of the form when the token is %p",
    (token) => {
      mockParams = { token };
      const { getByText, queryByPlaceholderText } = render(<ResetPasswordPage />);

      expect(queryByPlaceholderText("auth:fields.newPasswordPlaceholder")).toBeNull();
      fireEvent.press(getByText("auth:resetPassword.requestNewLink"));
      expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/forgot-password");
      expect(mockResetPassword).not.toHaveBeenCalled();
    }
  );
});
