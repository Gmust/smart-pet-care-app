/// <reference types="jest" />

import type { ReactNode } from "react";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AxiosError, AxiosHeaders } from "axios";

import { SignUpForm } from "./SignUpForm";

const mockTranslate = (key: string) => key;
const mockRouter = { replace: jest.fn(), push: jest.fn() };
const mockRegister = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
  // The real Trans renders the key's markup; the key itself is enough to find the row.
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
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

jest.mock("@/common/utils/legalUrls", () => ({
  openLegalUrl: jest.fn(),
  TERMS_URL: "https://example.test/terms.html",
  PRIVACY_URL: "https://example.test/privacy.html",
}));

jest.mock("@/api", () => ({
  postApiAuthRegister: (...args: unknown[]) => mockRegister(...args),
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

const renderForm = () => {
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

  return render(<SignUpForm />, { wrapper });
};

const fillIn = (utils: ReturnType<typeof render>) => {
  fireEvent.changeText(utils.getByPlaceholderText("auth:fields.emailPlaceholder"), "a@b.co");
  fireEvent.changeText(utils.getByPlaceholderText("auth:fields.passwordPlaceholder"), "Secret-1!");
  fireEvent.changeText(
    utils.getByPlaceholderText("auth:fields.passwordConfirmPlaceholder"),
    "Secret-1!"
  );
};

const acceptTerms = (utils: ReturnType<typeof render>) =>
  fireEvent.press(utils.getByRole("checkbox", { name: "auth:agreements.consentLabel" }));

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // A retained cache keeps React Query's notify timer alive and jest never exits.
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("SignUpForm", () => {
  it("sends the account with the consent the user gave and moves on to the code screen", async () => {
    mockRegister.mockImplementation(() => Promise.resolve({ data: {} }));
    const utils = renderForm();
    fillIn(utils);
    acceptTerms(utils);
    fireEvent.press(utils.getByText("auth:actions.register"));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith({
        email: "a@b.co",
        password: "Secret-1!",
        passwordConfirm: "Secret-1!",
        termsAccepted: true,
      })
    );
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/(auth)/confirm-email",
      params: { email: "a@b.co" },
    });
  });

  it("does not register without the consent, and says why", async () => {
    const utils = renderForm();
    fillIn(utils);
    fireEvent.press(utils.getByText("auth:actions.register"));

    expect(await utils.findByText("auth:validation.termsRequired")).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("does not show the consent error before the user tries to submit", () => {
    const utils = renderForm();
    fillIn(utils);

    expect(utils.queryByText("auth:validation.termsRequired")).toBeNull();
  });

  it("lists only the password rules that are still unmet once the user leaves the field", () => {
    const utils = renderForm();
    const password = utils.getByPlaceholderText("auth:fields.passwordPlaceholder");
    fireEvent.changeText(password, "secretsecret");
    fireEvent(password, "blur");

    expect(utils.getByText(/auth:validation\.passwordNeedsDigit/)).toBeTruthy();
    expect(utils.getByText(/auth:validation\.passwordNeedsSpecial/)).toBeTruthy();
    expect(utils.queryByText(/auth:validation\.passwordNeedsLetter/)).toBeNull();
    expect(utils.queryByText("auth:fields.passwordHint")).toBeNull();
  });

  it("shows the full password hint until the field has an error", () => {
    const utils = renderForm();

    expect(utils.getByText("auth:fields.passwordHint")).toBeTruthy();
  });

  it("puts every failed rule under its field, including the consent", async () => {
    // Real server shape: PascalCase keys and a duplicated alias.
    mockRegister.mockImplementation(() =>
      Promise.reject(
        apiFailure(400, "request_validation_failed", {
          Email: ["auth_email_invalid", "auth_email_invalid"],
          Password: ["auth_password_too_short", "auth_password_too_weak"],
          TermsAccepted: ["auth_terms_not_accepted"],
        })
      )
    );
    const utils = renderForm();
    fillIn(utils);
    acceptTerms(utils);
    fireEvent.press(utils.getByText("auth:actions.register"));

    expect(await utils.findByText("errors:codes.auth_email_invalid")).toBeTruthy();
    expect(utils.getAllByText("errors:codes.auth_email_invalid")).toHaveLength(1);
    expect(utils.getByText(/errors:codes\.auth_password_too_short/)).toBeTruthy();
    expect(utils.getByText(/errors:codes\.auth_password_too_weak/)).toBeTruthy();
    expect(utils.getByText(/errors:codes\.auth_terms_not_accepted/)).toBeTruthy();
    // The toast names the first failed rule, not the generic form-level alias.
    expect(toastMock).toHaveBeenCalledWith({
      type: "error",
      text1: "errors:codes.auth_email_invalid",
    });
  });
});
