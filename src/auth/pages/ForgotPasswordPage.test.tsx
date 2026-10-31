/// <reference types="jest" />

import type { ReactNode } from "react";
import { fireEvent, render } from "@testing-library/react-native";

import ForgotPasswordPage from "./ForgotPasswordPage";

const mockTranslate = (key: string) => key;
const mockRouter = { replace: jest.fn(), push: jest.fn(), dismissTo: jest.fn() };
let mockParams: Record<string, unknown> = {};
let mockStatus: "loading" | "authenticated" | "unauthenticated" = "unauthenticated";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

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

jest.mock("../queries/useForgotPasswordMutation", () => ({
  useForgotPasswordMutation: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ status: mockStatus }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  mockStatus = "unauthenticated";
});

describe("ForgotPasswordPage", () => {
  // Reached signed in from a dead reset link: sign-in there would stack a second account on top
  // of the live session, keeping the first one's push token and Google session.
  it("takes a signed-in user back to the app, never to sign-in", () => {
    mockStatus = "authenticated";
    const { getByText, queryByText } = render(<ForgotPasswordPage />);

    expect(queryByText("auth:forgotPassword.backToSignIn")).toBeNull();
    fireEvent.press(getByText("auth:forgotPassword.backToApp"));
    expect(mockRouter.dismissTo).toHaveBeenCalledWith("/(tabs)/home");
  });

  it("takes a signed-out user back to sign-in", () => {
    const { getByText } = render(<ForgotPasswordPage />);

    fireEvent.press(getByText("auth:forgotPassword.backToSignIn"));
    expect(mockRouter.dismissTo).toHaveBeenCalledWith("/(auth)/sign-in");
  });

  it("offers no way out while the session is still loading", () => {
    mockStatus = "loading";
    const { queryByText } = render(<ForgotPasswordPage />);

    expect(queryByText("auth:forgotPassword.backToSignIn")).toBeNull();
    expect(queryByText("auth:forgotPassword.backToApp")).toBeNull();
  });

  it.each([
    [{ email: "milo@example.com" }, "milo@example.com"],
    [{ email: ["a@example.com", "b@example.com"] }, ""],
  ])("prefills the email from %p as %p", (params, expected) => {
    mockParams = params;
    const { getByPlaceholderText } = render(<ForgotPasswordPage />);

    expect(getByPlaceholderText("auth:fields.emailPlaceholder").props.value).toBe(expected);
  });
});
