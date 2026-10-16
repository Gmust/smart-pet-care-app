/// <reference types="jest" />

import { fireEvent, render } from "@testing-library/react-native";

import AuthPage from "./AuthPage";

let mockParams: { agreed?: string; mode?: string } = {};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ signIn: jest.fn() }),
}));

jest.mock("../components/GoogleAuthButton", () => ({ GoogleAuthButton: () => null }));

jest.mock("../components/LegalLinks", () => ({ LegalLinks: () => null }));

// Renders what the form would submit with, so the test reads mode and acceptance directly.
jest.mock("../components/EmailAuthForm", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    EmailAuthForm: ({ mode, termsPreAccepted }: { mode: string; termsPreAccepted: boolean }) =>
      React.createElement(Text, null, `form:${mode}:${String(termsPreAccepted)}`),
  };
});

jest.mock("../components/AgreementsDialog", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    AgreementsDialog: ({ open, onAgree }: { open: boolean; onAgree: () => void }) =>
      open ? React.createElement(Text, { onPress: onAgree }, "dialog:agree") : null,
  };
});

describe("AuthPage terms gate", () => {
  it("asks for the terms before register when arriving without them (confirm-email)", () => {
    mockParams = { mode: "login" };
    const { getByText, queryByText } = render(<AuthPage />);

    expect(getByText("form:login:false")).toBeTruthy();

    fireEvent.press(getByText("auth:actions.switchToRegister"));
    expect(queryByText("form:register:false")).toBeNull();
    expect(getByText("form:login:false")).toBeTruthy();

    fireEvent.press(getByText("dialog:agree"));
    expect(getByText("form:register:true")).toBeTruthy();
    expect(queryByText("dialog:agree")).toBeNull();
  });

  it("starts in login on a bare deep link with no acceptance", () => {
    mockParams = {};
    const { getByText } = render(<AuthPage />);

    expect(getByText("form:login:false")).toBeTruthy();
  });

  it("switches freely once the terms were accepted on welcome", () => {
    mockParams = { agreed: "1" };
    const { getByText, queryByText } = render(<AuthPage />);

    expect(getByText("form:register:true")).toBeTruthy();

    fireEvent.press(getByText("auth:actions.switchToLogin"));
    fireEvent.press(getByText("auth:actions.switchToRegister"));
    expect(getByText("form:register:true")).toBeTruthy();
    expect(queryByText("dialog:agree")).toBeNull();
  });
});
