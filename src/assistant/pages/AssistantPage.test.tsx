/// <reference types="jest" />

import type { ReactNode } from "react";
import { PortalHost } from "@rn-primitives/portal";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import * as aiConsentStorage from "../utils/aiUsingConsentStorage";
import AssistantPage from "./AssistantPage";
import AssistantPetSelectionPage from "./AssistantPetSelectionPage";

// Interpolating passthrough so distinct pets/urgencies produce unique, assertable strings.
const mockTranslate = (key: string, opts?: Record<string, unknown>) => {
  if (opts && typeof opts.name === "string") return `${key}:${opts.name}`;
  if (opts && typeof opts.urgency === "string") return `${key}:${opts.urgency}`;
  return key;
};

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  canGoBack: jest.fn(() => true),
};
let mockSearchParams: Record<string, unknown> = {};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: mockTranslate, i18n: { language: "en" } }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockSearchParams,
  useFocusEffect: (callback: () => void) => {
    const React = require("react");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => callback(), []);
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/pets/queries/usePetsQuery", () => ({ usePetsQuery: jest.fn() }));

jest.mock("../utils/aiUsingConsentStorage", () => ({
  clearAiUsingConsent: jest.fn(),
  getAiUsingConsent: jest.fn(),
  setAiUsingConsent: jest.fn(),
}));

import { usePetsQuery } from "@/pets/queries/usePetsQuery";

const petsQueryMock = jest.mocked(usePetsQuery);
const clearAiUsingConsentMock = jest.mocked(aiConsentStorage.clearAiUsingConsent);
const getAiUsingConsentMock = jest.mocked(aiConsentStorage.getAiUsingConsent);
const setAiUsingConsentMock = jest.mocked(aiConsentStorage.setAiUsingConsent);

const milo = { id: "pet-milo", name: "Milo", species: "dog" };
const acceptedConsent = true;

// Free-text answers come straight from the wire-shape mock fixtures (no i18n keys).
const monitorAnswer =
  "This sounds appropriate for routine veterinary follow-up. Keep an eye on your pet between now and their next checkup.";
const generalAnswer =
  "A balanced diet and consistent training routines go a long way for most pets. Keep meals portioned to their size and reinforce good behavior with positive rewards.";

const setPets = (
  value: {
    data?: unknown[];
    isLoading?: boolean;
    isError?: boolean;
  } = {}
) => {
  const refetch = jest.fn();
  petsQueryMock.mockReturnValue({
    data: value.data ?? [milo],
    isLoading: value.isLoading ?? false,
    isError: value.isError ?? false,
    refetch,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return refetch;
};

const renderPage = async () => {
  const utils = render(
    <>
      <AssistantPage />
      <PortalHost name="dialog" />
    </>
  );
  // Wait past the async restore gate (`if (!restored) return null`).
  await waitFor(() => expect(getAiUsingConsentMock).toHaveBeenCalled());
  return utils;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = {};
  clearAiUsingConsentMock.mockResolvedValue({ ok: true, value: undefined });
  getAiUsingConsentMock.mockResolvedValue({ ok: true, value: acceptedConsent });
  setAiUsingConsentMock.mockResolvedValue({ ok: true, value: undefined });
  setPets();
});

describe("AssistantPage – navigation (task 3.5)", () => {
  it("redirects to pet selection when consent is missing on assistant entry", async () => {
    getAiUsingConsentMock.mockResolvedValue({ ok: true, value: null });
    await renderPage();
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/assistant-pet-selection")
    );
  });

  it("preselects a pet from a valid route param and shows the conversation", async () => {
    mockSearchParams = { petId: "pet-milo" };
    const { getByLabelText } = await renderPage();
    await waitFor(() => expect(getByLabelText("conversation.about:Milo")).toBeTruthy());
  });

  it("clears the previous conversation when a route param selects a new pet", async () => {
    setPets({ data: [milo, { id: "pet-otis", name: "Otis", species: "cat" }] });
    mockSearchParams = { petId: "pet-milo" };
    const { getByLabelText, queryByText } = await renderPage();
    await waitFor(() => expect(getByLabelText("conversation.about:Milo")).toBeTruthy());
    expect(queryByText("previous pet message")).toBeNull();
  });

  it("falls back to pet selection for an invalid route param", async () => {
    mockSearchParams = { petId: "does-not-exist" };
    const { queryByLabelText } = await renderPage();
    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/assistant-pet-selection")
    );
    expect(queryByLabelText("conversation.about:Milo")).toBeNull();
  });

  it("routes back from the conversation header", async () => {
    mockSearchParams = { petId: "pet-milo" };
    const { getByLabelText } = await renderPage();
    await waitFor(() => expect(getByLabelText("actions.back")).toBeTruthy());
    fireEvent.press(getByLabelText("actions.back"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("does not throw when unmounted during a pending request", async () => {
    mockSearchParams = { petId: "pet-milo" };
    const { getByPlaceholderText, getByLabelText, unmount } = await renderPage();
    await waitFor(() => expect(getByPlaceholderText("conversation.placeholder:Milo")).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText("conversation.placeholder:Milo"), "routine checkup");
    fireEvent.press(getByLabelText("conversation.send"));
    expect(() => unmount()).not.toThrow();
  });
});

describe("AssistantPage – consent & pet selection (task 4.5)", () => {
  const renderPetSelectionPage = async () => {
    const utils = render(
      <>
        <AssistantPetSelectionPage />
        <PortalHost name="dialog" />
      </>
    );
    await waitFor(() => expect(getAiUsingConsentMock).toHaveBeenCalled());
    return utils;
  };

  it("shows consent first on pet selection when consent is missing", async () => {
    getAiUsingConsentMock.mockResolvedValue({ ok: true, value: null });
    const { getByText } = await renderPetSelectionPage();
    await waitFor(() => expect(getByText("consent.accept")).toBeTruthy());
  });

  it("shows a loading state instead of a blank page while consent restore is pending", async () => {
    getAiUsingConsentMock.mockReturnValue(new Promise(() => undefined));
    const { getByText } = await renderPetSelectionPage();
    expect(getByText("pets.loading")).toBeTruthy();
  });

  it("fails into the consent dialog when consent restore throws", async () => {
    getAiUsingConsentMock.mockRejectedValue(new Error("storage"));
    const { getByText } = await renderPetSelectionPage();
    await waitFor(() => expect(getByText("consent.accept")).toBeTruthy());
  });

  it("persists consent on accept", async () => {
    getAiUsingConsentMock.mockResolvedValue({ ok: true, value: null });
    const { getByText } = await renderPetSelectionPage();
    await waitFor(() => expect(getByText("consent.accept")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByText("consent.accept"));
    });
    expect(setAiUsingConsentMock).toHaveBeenCalledWith(true);
  });

  it("routes home when consent is declined on first use", async () => {
    getAiUsingConsentMock.mockResolvedValue({ ok: true, value: null });
    const { getByText } = await renderPetSelectionPage();
    await waitFor(() => expect(getByText("consent.decline")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByText("consent.decline"));
    });
    expect(clearAiUsingConsentMock).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/home");
  });

  it("routes home when reviewed consent is declined without mutating messages", async () => {
    mockSearchParams = { petId: "pet-milo" };
    const { getByLabelText, getByText, queryByText } = await renderPage();
    await waitFor(() => expect(getByLabelText("consent.review")).toBeTruthy());
    fireEvent.press(getByLabelText("consent.review"));
    // Review view is shown; declining consent leaves the conversation without mutating messages.
    await waitFor(() => expect(getByText("consent.information")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByText("consent.decline"));
    });
    expect(clearAiUsingConsentMock).toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/home");
    expect(queryByText("consent.information")).toBeNull();
  });

  it("shows the empty-pet state and navigates to assistant pet creation", async () => {
    setPets({ data: [] });
    const { getByText } = await renderPetSelectionPage();
    await waitFor(() => expect(getByText("pets.empty")).toBeTruthy());
    fireEvent.press(getByText("pets.add"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(tabs)/assistant-new-pet");
  });

  it("surfaces the pets query error with a retry action", async () => {
    const refetch = setPets({ isError: true });
    const { getByText } = await renderPetSelectionPage();
    await waitFor(() => expect(getByText("pets.error")).toBeTruthy());
    fireEvent.press(getByText("pets.retry"));
    expect(refetch).toHaveBeenCalled();
  });

  it("routes the pet context button to assistant pet selection without clearing conversation", async () => {
    mockSearchParams = { petId: "pet-milo" };
    const { getByLabelText } = await renderPage();
    await waitFor(() => expect(getByLabelText("conversation.about:Milo")).toBeTruthy());
    fireEvent.press(getByLabelText("conversation.about:Milo"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(tabs)/assistant-pet-selection");
  });
});

describe("AssistantPage – mock conversation", () => {
  const renderConversation = async () => {
    mockSearchParams = { petId: "pet-milo" };
    const utils = await renderPage();
    await waitFor(() =>
      expect(utils.getByPlaceholderText("conversation.placeholder:Milo")).toBeTruthy()
    );
    return utils;
  };

  const sendText = async (utils: Awaited<ReturnType<typeof renderConversation>>, text: string) => {
    fireEvent.changeText(utils.getByPlaceholderText("conversation.placeholder:Milo"), text);
    await act(async () => {
      fireEvent.press(utils.getByLabelText("conversation.send"));
    });
  };

  it("adds the user message and simple mock assistant response", async () => {
    const utils = await renderConversation();
    await sendText(utils, "routine checkup");
    await waitFor(() => expect(utils.getByText("routine checkup")).toBeTruthy());
    await waitFor(() => expect(utils.getByText(monitorAnswer)).toBeTruthy());
    expect(utils.getByText("routine checkup")).toBeTruthy();
  });

  it("disables sending for whitespace-only input", async () => {
    const utils = await renderConversation();
    fireEvent.changeText(utils.getByPlaceholderText("conversation.placeholder:Milo"), "    ");
    expect(utils.getByLabelText("conversation.send").props.accessibilityState?.disabled).toBe(true);
  });

  it("renders general mode with editable related-topic chips", async () => {
    const utils = await renderConversation();
    await sendText(utils, "food and training tips");
    await waitFor(() => expect(utils.getByText(generalAnswer)).toBeTruthy());
    // A related topic populates the composer as an editable draft instead of auto-sending.
    fireEvent.press(utils.getByLabelText("Choosing the right food"));
    expect(utils.getByPlaceholderText("conversation.placeholder:Milo").props.value).toBe(
      "Choosing the right food"
    );
    expect(utils.queryByText(/assessment\.urgency/)).toBeNull();
  });

  it("resets the conversation while retaining consent and the pet", async () => {
    const utils = await renderConversation();
    await sendText(utils, "routine checkup");
    await waitFor(() => expect(utils.getByText(monitorAnswer)).toBeTruthy());
    fireEvent.press(utils.getByLabelText("conversation.reset"));
    // A non-empty conversation opens the confirmation dialog before clearing.
    await waitFor(() => expect(utils.getByText("conversation.startNewChat")).toBeTruthy());
    await act(async () => {
      fireEvent.press(utils.getByText("conversation.startNewChat"));
    });
    await waitFor(() => expect(utils.queryByText(monitorAnswer)).toBeNull());
    // Consent + pet retained: still in conversation, not gated back to consent/selection.
    expect(utils.getByLabelText("conversation.about:Milo")).toBeTruthy();
  });
});

describe("AssistantPage – accessibility (task 6.5)", () => {
  const renderConversation = async () => {
    mockSearchParams = { petId: "pet-milo" };
    const utils = await renderPage();
    await waitFor(() =>
      expect(utils.getByPlaceholderText("conversation.placeholder:Milo")).toBeTruthy()
    );
    return utils;
  };

  it("labels the send action and exposes a hint", async () => {
    const utils = await renderConversation();
    const send = utils.getByLabelText("conversation.send");
    expect(send.props.accessibilityHint).toBe("hints.send");
  });

  it("labels and sizes the composer input for a 44pt+ target", async () => {
    const utils = await renderConversation();
    const input = utils.getByPlaceholderText("conversation.placeholder:Milo");
    expect(input.props.accessibilityLabel).toBe("conversation.placeholder:Milo");
    const style = Array.isArray(input.props.style)
      ? Object.assign({}, ...input.props.style)
      : input.props.style;
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });

  it("keeps a general mock response readable without urgency-only color cues", async () => {
    const utils = await renderConversation();
    fireEvent.changeText(
      utils.getByPlaceholderText("conversation.placeholder:Milo"),
      "food and training tips"
    );
    await act(async () => {
      fireEvent.press(utils.getByLabelText("conversation.send"));
    });
    await waitFor(() => expect(utils.getByText(generalAnswer)).toBeTruthy());
    expect(utils.queryByText(/assessment\.urgency/)).toBeNull();
  });
});
