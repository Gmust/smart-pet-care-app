/// <reference types="jest" />

import type { ReactNode } from "react";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import type * as GoogleAuthButtonModule from "./GoogleAuthButton";

const mockTranslate = (key: string) => key;
const mockSignIn = jest.fn();
const mockGoogleExchange = jest.fn();
const mockClose = jest.fn();
let mockDismissSheet: () => void = () => undefined;
let mockSetSheetOpen: (open: boolean) => void = () => undefined;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

// getApiErrorMessage translates through the global instance, not the hook.
jest.mock("i18next", () => ({
  __esModule: true,
  default: { t: (key: string) => mockTranslate(key) },
}));

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn(), hide: jest.fn() },
}));

// The native Google SDK: the picker itself is verified on a device, not here.
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: (...args: unknown[]) => mockSignIn(...args),
  },
  isErrorWithCode: () => false,
  isSuccessResponse: (response: { type: string }) => response.type === "success",
  statusCodes: { SIGN_IN_CANCELLED: "cancelled", IN_PROGRESS: "in_progress" },
}));

jest.mock("@/api", () => ({
  postApiAuthOauthGoogleMobile: (...args: unknown[]) => mockGoogleExchange(...args),
}));

jest.mock("@/common/utils/legalUrls", () => ({
  openLegalUrl: jest.fn(),
  TERMS_URL: "https://example.test/terms.html",
  PRIVACY_URL: "https://example.test/privacy.html",
}));

// The drawer wraps @gorhom/bottom-sheet, which needs the real Reanimated at import time. This test
// is about the order of consent and sign-in, so the sheet becomes plain views and the test decides
// when it has "finished closing" by calling the onDismiss the button handed to DrawerContent.
jest.mock("@/shadecn/ui/drawer", () => {
  // No JSX in here: Babel registers named components with an out-of-scope helper, which
  // jest.mock factories reject. createElement sidesteps that.
  const React = require("react");
  const { Text, View } = require("react-native");
  const plain = (testID: string) => {
    const Plain = ({ children }: { children?: ReactNode }) =>
      React.createElement(View, { testID }, children);
    Plain.displayName = `Mock(${testID})`;
    return Plain;
  };
  return {
    Drawer: ({
      open,
      onOpenChange,
      children,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      children?: ReactNode;
    }) => {
      mockSetSheetOpen = onOpenChange;
      return open ? React.createElement(View, { testID: "drawer" }, children) : null;
    },
    DrawerContent: ({ onDismiss, children }: { onDismiss: () => void; children?: ReactNode }) => {
      // Like the real sheet: it reports closed first, then calls onDismiss.
      mockDismissSheet = () => {
        mockSetSheetOpen(false);
        onDismiss();
      };
      return React.createElement(View, { testID: "drawer-content" }, children);
    },
    DrawerHeader: plain("drawer-header"),
    DrawerTitle: ({ children }: { children?: ReactNode }) =>
      React.createElement(Text, null, children),
    DrawerFooter: plain("drawer-footer"),
    useDrawerClose: () => mockClose,
  };
});

// Loaded after the env is set: the button reads the client id when the module is first imported.
let GoogleAuthButton: typeof GoogleAuthButtonModule.GoogleAuthButton;

beforeAll(() => {
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = "web-client-id";
  GoogleAuthButton = require("./GoogleAuthButton").GoogleAuthButton;
});

const clients: QueryClient[] = [];

const toastMock = jest.mocked(Toast.show);

const renderButton = (onAuthenticated: jest.Mock = jest.fn(() => Promise.resolve())) => {
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

  return {
    ...render(<GoogleAuthButton onAuthenticated={onAuthenticated} />, { wrapper }),
    onAuthenticated,
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSignIn.mockImplementation(() =>
    Promise.resolve({ type: "success", data: { idToken: "google-token" } })
  );
  mockGoogleExchange.mockImplementation(() =>
    Promise.resolve({ data: { accessToken: "session-token" } })
  );
});

afterEach(() => {
  // A retained cache keeps React Query's notify timer alive and jest never exits.
  for (const client of clients.splice(0)) {
    client.clear();
  }
});

describe("GoogleAuthButton consent", () => {
  it("asks for the terms first and does not open the account picker yet", () => {
    const utils = renderButton();
    fireEvent.press(utils.getByText("auth:actions.google"));

    expect(utils.getByText("auth:agreements.title")).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("opens the account picker only once the sheet has finished closing", async () => {
    const utils = renderButton();
    fireEvent.press(utils.getByText("auth:actions.google"));
    fireEvent.press(utils.getByText("auth:agreements.agree"));

    expect(mockClose).toHaveBeenCalled();
    // Let any started sign-in run past its first await before checking it did not start.
    await act(async () => undefined);
    expect(mockSignIn).not.toHaveBeenCalled();

    act(() => mockDismissSheet());

    await waitFor(() =>
      expect(mockGoogleExchange).toHaveBeenCalledWith({ idToken: "google-token" })
    );
    expect(utils.onAuthenticated).toHaveBeenCalledWith({ accessToken: "session-token" });
  });

  it("does not sign in when the sheet is declined", async () => {
    const utils = renderButton();
    fireEvent.press(utils.getByText("auth:actions.google"));
    fireEvent.press(utils.getByText("auth:agreements.cancel"));

    act(() => mockDismissSheet());
    await act(async () => undefined);

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("asks again the next time instead of remembering an earlier agreement", async () => {
    const utils = renderButton();
    fireEvent.press(utils.getByText("auth:actions.google"));
    fireEvent.press(utils.getByText("auth:agreements.agree"));
    act(() => mockDismissSheet());
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));

    // A dismiss with no agreement behind it must not start another sign-in.
    act(() => mockDismissSheet());

    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it("tells the user when the session could not be stored after Google accepted them", async () => {
    const onAuthenticated = jest.fn(() => Promise.reject(new Error("SecureStore failed")));
    const utils = renderButton(onAuthenticated);
    fireEvent.press(utils.getByText("auth:actions.google"));
    fireEvent.press(utils.getByText("auth:agreements.agree"));
    act(() => mockDismissSheet());

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith({ type: "error", text1: "auth:errors.googleFailed" })
    );
  });

  it("ignores a second tap while Google sign-in is still running", async () => {
    mockSignIn.mockImplementation(() => new Promise(() => undefined));
    const utils = renderButton();
    fireEvent.press(utils.getByText("auth:actions.google"));
    fireEvent.press(utils.getByText("auth:agreements.agree"));
    act(() => mockDismissSheet());
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));

    // While loading the button shows a spinner instead of its label, so it is found by role alone.
    fireEvent.press(utils.getByRole("button"));

    expect(utils.queryByText("auth:agreements.title")).toBeNull();
  });
});
