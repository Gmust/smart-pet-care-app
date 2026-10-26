/// <reference types="jest" />

import type { ReactNode } from "react";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import { SignInForm } from "./SignInForm";

const mockTranslate = (key: string) => key;
const mockRouter = { replace: jest.fn(), push: jest.fn() };
const mockLogin = jest.fn();

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
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

jest.mock("@/api", () => ({
  postApiAuthLogin: (...args: unknown[]) => mockLogin(...args),
}));

const toastMock = jest.mocked(Toast.show);

const apiFailure = (status: number, code: string, errors?: Record<string, string[]>) => {
  const error = new AxiosError("Request failed", "ERR_BAD_REQUEST");
  error.response = {
    data: { code, message: code, traceId: "trace", errors },
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
};

const clients: QueryClient[] = [];

const renderForm = (onAuthenticated: () => Promise<void> = () => Promise.resolve()) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
  clients.push(queryClient);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<SignInForm onAuthenticated={onAuthenticated} />, { wrapper });
};

const signInWith = (email: string, onAuthenticated?: () => Promise<void>) => {
  const utils = renderForm(onAuthenticated);
  fireEvent.changeText(utils.getByPlaceholderText("auth:fields.emailPlaceholder"), email);
  fireEvent.changeText(utils.getByPlaceholderText("auth:fields.passwordPlaceholder"), "Secret-1!");
  fireEvent.press(utils.getByText("auth:actions.login"));
  return utils;
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // A retained cache keeps React Query's notify timer alive and jest never exits.
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("SignInForm validation timing", () => {
  it("does not flag a field while the user is still typing in it", () => {
    const utils = renderForm();
    fireEvent.changeText(utils.getByPlaceholderText("auth:fields.emailPlaceholder"), "m");

    expect(utils.queryByText("auth:validation.emailInvalid")).toBeNull();
    expect(utils.queryByText("auth:validation.passwordRequired")).toBeNull();
  });

  it("flags a field once the user leaves it, and clears the error as they fix it", () => {
    const utils = renderForm();
    const email = utils.getByPlaceholderText("auth:fields.emailPlaceholder");
    fireEvent.changeText(email, "milo");
    fireEvent(email, "blur");
    expect(utils.getByText("auth:validation.emailInvalid")).toBeTruthy();

    fireEvent.changeText(email, "milo@example.com");
    expect(utils.queryByText("auth:validation.emailInvalid")).toBeNull();
  });

  it("shows every error on submit and keeps the button usable", async () => {
    const utils = renderForm();
    fireEvent.press(utils.getByText("auth:actions.login"));

    expect(await utils.findByText("auth:validation.emailInvalid")).toBeTruthy();
    expect(utils.getByText("auth:validation.passwordRequired")).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(utils.getByRole("button", { name: "auth:actions.login" })).toBeEnabled();
  });
});

describe("SignInForm", () => {
  it("welcomes the user back only once the session is stored", async () => {
    mockLogin.mockImplementation(() => Promise.resolve({ data: { accessToken: "token" } }));
    let finishSignIn: () => void = () => undefined;
    const onAuthenticated = jest.fn(() => new Promise<void>((resolve) => (finishSignIn = resolve)));
    signInWith("milo@example.com", onAuthenticated);

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith({ accessToken: "token" }));
    expect(toastMock).not.toHaveBeenCalled();

    await act(async () => finishSignIn());

    expect(toastMock).toHaveBeenCalledWith({
      type: "success",
      text1: "auth:success.welcomeBackTitle",
      text2: "auth:success.welcomeBackBody",
    });
  });

  it("says so when the session could not be stored, instead of welcoming the user back", async () => {
    mockLogin.mockImplementation(() => Promise.resolve({ data: { accessToken: "token" } }));
    const onAuthenticated = jest.fn(() => Promise.reject(new Error("SecureStore failed")));
    const utils = signInWith("milo@example.com", onAuthenticated);

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({ type: "error", text1: "auth:errors.signInFailed" })
    );
    expect(toastMock).not.toHaveBeenCalledWith(expect.objectContaining({ type: "success" }));
    expect(utils.getByRole("button", { name: "auth:actions.login" })).toBeEnabled();
  });

  it("masks the password until the user reveals it", () => {
    const utils = renderForm();
    const password = utils.getByPlaceholderText("auth:fields.passwordPlaceholder");
    expect(password.props.secureTextEntry).toBe(true);
    expect(password.props.autoCorrect).toBe(false);

    fireEvent.press(utils.getByRole("button", { name: "auth:fields.showPassword" }));
    expect(password.props.secureTextEntry).toBe(false);
    // Android drops the password flag once revealed; no suggestions keeps the keyboard from learning it.
    expect(password.props.autoCorrect).toBe(false);
    expect(utils.getByRole("button", { name: "auth:fields.hidePassword" })).toBeTruthy();
  });

  it("sends an unconfirmed account to the code screen with its email", async () => {
    mockLogin.mockImplementation(() => Promise.reject(apiFailure(403, "EMAIL_NOT_CONFIRMED")));
    signInWith("milo@example.com");

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: "/(auth)/confirm-email",
        params: { email: "milo@example.com" },
      })
    );
    expect(toastMock).toHaveBeenCalledWith({
      type: "info",
      text1: "errors:codes.EMAIL_NOT_CONFIRMED",
    });
  });

  it("keeps a wrong password on the form", async () => {
    mockLogin.mockImplementation(() => Promise.reject(apiFailure(401, "auth_invalid_credentials")));
    signInWith("milo@example.com");

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        type: "error",
        text1: "errors:codes.auth_invalid_credentials",
      })
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("ignores a server error for a field that is not on screen, so it cannot block submit", async () => {
    // The sign-in form has no password-confirm input, so the alias has nowhere to show.
    mockLogin.mockImplementation(() =>
      Promise.reject(
        apiFailure(400, "request_validation_failed", {
          PasswordConfirm: ["auth_password_confirm_required"],
        })
      )
    );
    const utils = signInWith("milo@example.com");

    // Not shown under any field, so the toast is where it reaches the user.
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({
        type: "error",
        text1: "errors:codes.auth_password_confirm_required",
      })
    );
    expect(utils.getByRole("button", { name: "auth:actions.login" })).toBeEnabled();
  });
});
