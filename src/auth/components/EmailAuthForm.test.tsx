/// <reference types="jest" />

import Toast from "react-native-toast-message";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import { EmailAuthForm } from "./EmailAuthForm";

const mockTranslate = (key: string) => key;
const mockRouter = { replace: jest.fn(), push: jest.fn() };
const mockLogin = jest.fn();
const mockRegister = jest.fn();

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

jest.mock("../queries/useLoginMutation", () => ({
  useLoginMutation: () => ({ mutateAsync: mockLogin }),
}));

jest.mock("../queries/useRegisterMutation", () => ({
  useRegisterMutation: () => ({ mutateAsync: mockRegister }),
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

const signInWith = (email: string) => {
  const utils = render(<EmailAuthForm mode="login" termsPreAccepted onAuthenticated={jest.fn()} />);
  fireEvent.changeText(utils.getByPlaceholderText("auth:fields.emailPlaceholder"), email);
  fireEvent.changeText(utils.getByPlaceholderText("auth:fields.passwordPlaceholder"), "Secret-1!");
  fireEvent.press(utils.getByText("auth:actions.login"));
  return utils;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EmailAuthForm", () => {
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

  it("puts every failed rule under its field on register, ignoring fields the form lacks", async () => {
    // Real server shape: PascalCase keys, a duplicated alias, and a field
    // (Terms) that has no input on this form.
    mockRegister.mockImplementation(() =>
      Promise.reject(
        apiFailure(400, "request_validation_failed", {
          Email: ["auth_email_invalid", "auth_email_invalid"],
          Password: ["auth_password_too_short", "auth_password_too_weak"],
          TermsAccepted: ["auth_terms_not_accepted"],
        })
      )
    );
    const utils = render(
      <EmailAuthForm mode="register" termsPreAccepted onAuthenticated={jest.fn()} />
    );
    fireEvent.changeText(utils.getByPlaceholderText("auth:fields.emailPlaceholder"), "a@b.co");
    fireEvent.changeText(
      utils.getByPlaceholderText("auth:fields.passwordPlaceholder"),
      "Secret-1!"
    );
    fireEvent.changeText(
      utils.getByPlaceholderText("auth:fields.passwordConfirmPlaceholder"),
      "Secret-1!"
    );
    fireEvent.press(utils.getByText("auth:actions.register"));

    expect(await utils.findByText("errors:codes.auth_email_invalid")).toBeTruthy();
    expect(utils.getAllByText("errors:codes.auth_email_invalid")).toHaveLength(1);
    expect(utils.getByText(/errors:codes\.auth_password_too_short/)).toBeTruthy();
    expect(utils.getByText(/errors:codes\.auth_password_too_weak/)).toBeTruthy();
    expect(utils.queryByText(/auth_terms_not_accepted/)).toBeNull();
    // The toast names the first failed rule, not the generic form-level alias.
    expect(toastMock).toHaveBeenCalledWith({
      type: "error",
      text1: "errors:codes.auth_email_invalid",
    });
  });

  it("ignores a server error for a field that is not on screen, so it cannot block submit", async () => {
    // Login renders no password-confirm input, but the form still holds its value.
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
