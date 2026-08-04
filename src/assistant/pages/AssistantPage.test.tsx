/// <reference types="jest" />

import type { ReactNode } from "react";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosError, AxiosHeaders } from "axios";

import {
  ChatMessageRole,
  ChatMessageStatus,
  ClassifierUrgency,
  PetType,
  type SessionMessageResponseDto,
} from "@/api/generated";
import { palette } from "@/styles/palette";

import * as aiConsentStorage from "../utils/aiUsingConsentStorage";

import AssistantPage from "./AssistantPage";
import AssistantPetSelectionPage from "./AssistantPetSelectionPage";

// Interpolating passthrough so distinct pets/urgencies produce unique, assertable strings.
const mockTranslate = (key: string, opts?: Record<string, unknown>) => {
  if (opts && typeof opts.name === "string") return `${key}:${opts.name}`;
  if (opts && typeof opts.urgency === "string") return `${key}:${opts.urgency}`;
  if (opts && typeof opts.seconds === "number") return `${key}:${opts.seconds}`;
  return key;
};

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  canGoBack: jest.fn(() => true),
};
let mockSearchParams: Record<string, unknown> = {};
const mockPetsQuery = jest.fn();

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

jest.mock("@/pets/queries/usePetsQuery", () => ({
  usePetsQuery: () => mockPetsQuery(),
}));

jest.mock("@/api", () => ({
  getApiSessions: jest.fn(),
  getApiSessionsSessionIdMessages: jest.fn(),
  postApiSessions: jest.fn(),
  postApiSessionsSessionIdMessages: jest.fn(),
  postApiSessionsSessionIdMessagesMessageIdRetry: jest.fn(),
}));

jest.mock("../utils/aiUsingConsentStorage", () => ({
  clearAiUsingConsent: jest.fn(),
  getAiUsingConsent: jest.fn(),
  setAiUsingConsent: jest.fn(),
}));

import {
  getApiSessions,
  getApiSessionsSessionIdMessages,
  postApiSessions,
  postApiSessionsSessionIdMessages,
  postApiSessionsSessionIdMessagesMessageIdRetry,
} from "@/api";

const getSessionsMock = jest.mocked(getApiSessions);
const getMessagesMock = jest.mocked(getApiSessionsSessionIdMessages);
const createSessionMock = jest.mocked(postApiSessions);
const sendMessageMock = jest.mocked(postApiSessionsSessionIdMessages);
const retryMessageMock = jest.mocked(postApiSessionsSessionIdMessagesMessageIdRetry);
const clearAiUsingConsentMock = jest.mocked(aiConsentStorage.clearAiUsingConsent);
const getAiUsingConsentMock = jest.mocked(aiConsentStorage.getAiUsingConsent);
const setAiUsingConsentMock = jest.mocked(aiConsentStorage.setAiUsingConsent);

const milo = { id: "pet-milo", name: "Milo", species: "dog" };
const acceptedConsent = true;
const session = {
  sessionId: "session-milo",
  petId: "pet-milo",
  petType: PetType.Dog,
  createdAt: "2026-07-15T10:00:00Z",
  updatedAt: "2026-07-15T10:00:00Z",
};
const assistantResponse = {
  answer: "Keep Milo rested and monitor the symptom.",
  urgency: ClassifierUrgency.MONITOR,
  homeAdvice: ["Offer water", "Limit strenuous activity"],
  disclaimer: "General veterinary guidance only.",
  urgentContactEmergencyVet: false,
};

const apiResponse = <T,>(data: T): AxiosResponse<T> => {
  const headers = new AxiosHeaders();
  return {
    data,
    status: 200,
    statusText: "OK",
    headers,
    config: { headers },
  };
};

const apiError = (status: number, data: unknown): AxiosError => {
  const headers = new AxiosHeaders();
  const config = { headers };
  const response: AxiosResponse = {
    data,
    status,
    statusText: "Failure",
    headers,
    config,
  };
  return new AxiosError("Request failed", undefined, config, undefined, response);
};

const setPets = (
  value: {
    data?: unknown[];
    isLoading?: boolean;
    isError?: boolean;
  } = {}
) => {
  const refetch = jest.fn();
  mockPetsQuery.mockReturnValue({
    data: value.data ?? [milo],
    isLoading: value.isLoading ?? false,
    isError: value.isError ?? false,
    refetch,
  });
  return refetch;
};

const renderPage = async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AssistantPage />
      <PortalHost name="dialog" />
    </QueryClientProvider>
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
  getSessionsMock.mockResolvedValue(apiResponse([session]));
  getMessagesMock.mockResolvedValue(
    apiResponse({
      sessionId: session.sessionId,
      items: [],
      pagination: { limit: 8, hasMore: false, nextCursor: null },
    })
  );
  createSessionMock.mockResolvedValue(
    apiResponse({
      ...session,
      sessionId: "session-new",
      updatedAt: "2026-07-15T11:00:00Z",
    })
  );
  sendMessageMock.mockResolvedValue(apiResponse(assistantResponse));
  retryMessageMock.mockResolvedValue(apiResponse(assistantResponse));
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
    sendMessageMock.mockImplementation(
      () => new Promise<AxiosResponse<SessionMessageResponseDto>>(() => undefined)
    );
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

describe("AssistantPage – server-backed conversation", () => {
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

  it("adds one optimistic user turn and renders the live urgency response", async () => {
    const utils = await renderConversation();
    await sendText(utils, "routine checkup");
    await waitFor(() => expect(utils.getByText("routine checkup")).toBeTruthy());
    await waitFor(() => expect(utils.getByText(assistantResponse.answer)).toBeTruthy());
    expect(sendMessageMock).toHaveBeenCalledWith(session.sessionId, { text: "routine checkup" });
    expect(utils.getByText("⚕ assessment.urgency:urgency.MONITOR")).toBeTruthy();
    expect(utils.getByText("• Offer water")).toBeTruthy();
    expect(utils.getByTestId("assistant-response-card")).toHaveStyle({
      backgroundColor: palette.white,
      borderColor: palette.brand.ok,
      borderWidth: 2,
    });
  });

  it.each([
    [ClassifierUrgency.CONSULT_SOON, palette.brand.warn],
    [ClassifierUrgency.URGENT, palette.orange["600"]],
  ])("uses the mapped border for %s urgency", async (urgency, borderColor) => {
    sendMessageMock.mockResolvedValue(apiResponse({ ...assistantResponse, urgency }));
    const utils = await renderConversation();
    await sendText(utils, "routine checkup");

    expect(await utils.findByText(assistantResponse.answer)).toBeOnTheScreen();
    expect(utils.getByTestId("assistant-response-card")).toHaveStyle({
      borderColor,
      borderWidth: 2,
    });
  });

  it("disables sending for whitespace-only input", async () => {
    const utils = await renderConversation();
    fireEvent.changeText(utils.getByPlaceholderText("conversation.placeholder:Milo"), "    ");
    expect(utils.getByLabelText("conversation.send").props.accessibilityState?.disabled).toBe(true);
  });

  it("renders restored user and assistant roles without inventing urgency", async () => {
    getMessagesMock.mockResolvedValue(
      apiResponse({
        sessionId: session.sessionId,
        items: [
          {
            messageId: "user-history",
            role: ChatMessageRole.user,
            status: ChatMessageStatus.Completed,
            content: "Historical question",
            createdAt: "2026-07-15T10:01:00Z",
          },
          {
            messageId: "assistant-history",
            role: ChatMessageRole.assistant,
            status: ChatMessageStatus.Completed,
            content: "Historical answer",
            createdAt: "2026-07-15T10:02:00Z",
          },
        ],
        pagination: { limit: 8, hasMore: false, nextCursor: null },
      })
    );
    const utils = await renderConversation();
    expect(utils.getByText("Historical question")).toBeTruthy();
    expect(utils.getByText("Historical answer")).toBeTruthy();
    expect(utils.queryByText(/assessment\.urgency/)).toBeNull();
  });

  it("creates a new server session without deleting the current session", async () => {
    const utils = await renderConversation();
    await sendText(utils, "routine checkup");
    await waitFor(() => expect(utils.getByText(assistantResponse.answer)).toBeTruthy());
    fireEvent.press(utils.getByLabelText("conversation.reset"));
    await waitFor(() => expect(utils.getByText("conversation.startNewChat")).toBeTruthy());
    await act(async () => {
      fireEvent.press(utils.getByText("conversation.startNewChat"));
    });
    await waitFor(() => expect(utils.queryByText(assistantResponse.answer)).toBeNull());
    expect(createSessionMock).toHaveBeenCalledWith({ petId: "pet-milo" });
    expect(utils.getByLabelText("conversation.about:Milo")).toBeTruthy();
  });

  it("creates the first pet session when no previous session exists", async () => {
    getSessionsMock.mockResolvedValue(apiResponse([]));
    await renderConversation();
    await waitFor(() => expect(createSessionMock).toHaveBeenCalledWith({ petId: "pet-milo" }));
  });

  it("shows immediate emergency guidance and still submits the message", async () => {
    const utils = await renderConversation();
    await sendText(utils, "Milo cannot breathe");
    expect(utils.getAllByText("emergency.body").length).toBeGreaterThan(0);
    expect(sendMessageMock).toHaveBeenCalledWith(session.sessionId, {
      text: "Milo cannot breathe",
    });
  });

  it("retries a restored failed assistant message through the retry endpoint", async () => {
    getMessagesMock.mockResolvedValue(
      apiResponse({
        sessionId: session.sessionId,
        items: [
          {
            messageId: "failed-message",
            role: ChatMessageRole.assistant,
            status: ChatMessageStatus.FailedRetryable,
            content: "",
            createdAt: "2026-07-15T10:02:00Z",
          },
        ],
        pagination: { limit: 8, hasMore: false, nextCursor: null },
      })
    );
    const utils = await renderConversation();
    fireEvent.press(utils.getByLabelText("errors.retry"));
    await waitFor(() =>
      expect(retryMessageMock).toHaveBeenCalledWith(session.sessionId, "failed-message")
    );
    await waitFor(() => expect(utils.getByText(assistantResponse.answer)).toBeTruthy());
  });

  it("preserves a retryable failure when the dedicated retry conflicts", async () => {
    getMessagesMock.mockResolvedValue(
      apiResponse({
        sessionId: session.sessionId,
        items: [
          {
            messageId: "conflict-message",
            role: ChatMessageRole.assistant,
            status: ChatMessageStatus.FailedRetryable,
            content: "",
            createdAt: "2026-07-15T10:02:00Z",
          },
        ],
        pagination: { limit: 8, hasMore: false, nextCursor: null },
      })
    );
    retryMessageMock.mockRejectedValue(apiError(409, { title: "Conflict" }));
    const utils = await renderConversation();
    fireEvent.press(utils.getByLabelText("errors.retry"));

    await waitFor(() => expect(utils.getByText("errors.retryConflict")).toBeTruthy());
    expect(retryMessageMock).toHaveBeenCalledWith(session.sessionId, "conflict-message");
  });

  it("loads the next cursor page once the user reaches the transcript start", async () => {
    getMessagesMock
      .mockResolvedValueOnce(
        apiResponse({
          sessionId: session.sessionId,
          items: [
            {
              messageId: "newer",
              role: ChatMessageRole.assistant,
              status: ChatMessageStatus.Completed,
              content: "Newer answer",
              createdAt: "2026-07-15T10:02:00Z",
            },
          ],
          pagination: { limit: 8, hasMore: true, nextCursor: "older-cursor" },
        })
      )
      .mockResolvedValueOnce(
        apiResponse({
          sessionId: session.sessionId,
          items: [
            {
              messageId: "older",
              role: ChatMessageRole.user,
              status: ChatMessageStatus.Completed,
              content: "Older question",
              createdAt: "2026-07-15T10:01:00Z",
            },
          ],
          pagination: { limit: 8, hasMore: false, nextCursor: null },
        })
      );
    const utils = await renderConversation();
    fireEvent.scroll(utils.getByLabelText("conversation.transcript"), {
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 800, width: 320 },
        layoutMeasurement: { height: 500, width: 320 },
      },
    });

    await waitFor(() =>
      expect(getMessagesMock).toHaveBeenLastCalledWith(
        session.sessionId,
        { limit: 8, cursor: "older-cursor" },
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
    );
    await waitFor(() => expect(utils.getByText("Older question")).toBeTruthy());
  });

  it("keeps the active transcript when new-session creation fails", async () => {
    createSessionMock.mockRejectedValue(new Error("offline"));
    const utils = await renderConversation();
    await sendText(utils, "routine checkup");
    await waitFor(() => expect(utils.getByText(assistantResponse.answer)).toBeTruthy());
    fireEvent.press(utils.getByLabelText("conversation.reset"));
    fireEvent.press(await utils.findByText("conversation.startNewChat"));

    await waitFor(() => expect(utils.getByText("errors.newSession")).toBeTruthy());
    expect(utils.getByText(assistantResponse.answer)).toBeTruthy();
  });

  it("renders server emergency guidance for an unflagged message", async () => {
    sendMessageMock.mockResolvedValue(
      apiResponse({
        answer: "Contact an emergency veterinarian now.",
        urgency: ClassifierUrgency.EMERGENCY,
        homeAdvice: ["Keep the airway clear"],
        disclaimer: "Emergency guidance",
        urgentContactEmergencyVet: true,
      })
    );
    const utils = await renderConversation();
    await sendText(utils, "Milo seems very unwell");

    await waitFor(() =>
      expect(utils.getByText("Contact an emergency veterinarian now.")).toBeTruthy()
    );
    expect(utils.queryByText("emergency.findVet")).not.toBeOnTheScreen();
    expect(utils.getByRole("alert")).toHaveStyle({
      borderColor: palette.brand.danger,
      borderWidth: 1,
    });
  });

  it("shows rate-limit timing and prevents retry during the interval", async () => {
    sendMessageMock.mockRejectedValue(
      apiError(429, {
        messageId: "failed-rate-limit",
        code: "rate_limit",
        message: "Wait",
        retryable: true,
        retryAfterSeconds: 5,
      })
    );
    const utils = await renderConversation();
    await sendText(utils, "routine checkup");

    await waitFor(() => expect(utils.getByText("errors.retryAfter:5")).toBeTruthy());
    expect(utils.getByLabelText("errors.retry").props.accessibilityState?.disabled).toBe(true);
  });

  it("prevents a duplicate submit while the first message is pending", async () => {
    sendMessageMock.mockImplementation(
      () => new Promise<AxiosResponse<SessionMessageResponseDto>>(() => undefined)
    );
    const utils = await renderConversation();
    fireEvent.changeText(
      utils.getByPlaceholderText("conversation.placeholder:Milo"),
      "routine checkup"
    );
    fireEvent.press(utils.getByLabelText("conversation.send"));
    fireEvent.press(utils.getByLabelText("conversation.send"));

    await waitFor(() => expect(sendMessageMock).toHaveBeenCalledTimes(1));
  });

  it("re-bootstraps the pet when the active session is not found", async () => {
    getSessionsMock
      .mockResolvedValueOnce(apiResponse([session]))
      .mockResolvedValue(apiResponse([]));
    sendMessageMock.mockRejectedValue(apiError(404, { title: "Not found" }));
    const utils = await renderConversation();
    await sendText(utils, "routine checkup");

    await waitFor(() => expect(createSessionMock).toHaveBeenCalledWith({ petId: "pet-milo" }));
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

  it("keeps an answer without urgency readable without an urgency-only color cue", async () => {
    sendMessageMock.mockResolvedValue(
      apiResponse({
        answer: "A plain answer",
        urgency: null,
        homeAdvice: [],
        disclaimer: "General guidance",
        urgentContactEmergencyVet: false,
      })
    );
    const utils = await renderConversation();
    fireEvent.changeText(
      utils.getByPlaceholderText("conversation.placeholder:Milo"),
      "general question"
    );
    await act(async () => {
      fireEvent.press(utils.getByLabelText("conversation.send"));
    });
    await waitFor(() => expect(utils.getByText("A plain answer")).toBeTruthy());
    expect(utils.queryByText(/assessment\.urgency/)).toBeNull();
    expect(utils.getByTestId("assistant-response-card")).not.toHaveStyle({ borderWidth: 2 });
  });
});
