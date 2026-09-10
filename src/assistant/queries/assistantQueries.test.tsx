/// <reference types="jest" />

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";

import {
  getApiSessions,
  getApiSessionsSessionIdMessages,
  postApiSessions,
  postApiSessionsSessionIdMessages,
  postApiSessionsSessionIdMessagesMessageIdRetry,
} from "@/api";
import {
  ChatMessageRole,
  type ChatSessionResponseDto,
  ClassifierUrgency,
  PetType,
  type SessionMessagesPageResponseDto,
} from "@/api/generated";

import { assistantQueryKeys } from "./assistantQueryKeys";
import { useAssistantMessagesQuery } from "./useAssistantMessagesQuery";
import { useAssistantSessionBootstrap } from "./useAssistantSessionBootstrap";
import { useCreateAssistantSessionMutation } from "./useCreateAssistantSessionMutation";
import { useRetryAssistantMessageMutation } from "./useRetryAssistantMessageMutation";
import { useSendAssistantMessageMutation } from "./useSendAssistantMessageMutation";

jest.mock("expo-crypto", () => ({
  randomUUID: () => "test-client-message-id",
}));

jest.mock("@/api", () => ({
  getApiSessions: jest.fn(),
  getApiSessionsSessionIdMessages: jest.fn(),
  postApiSessions: jest.fn(),
  postApiSessionsSessionIdMessages: jest.fn(),
  postApiSessionsSessionIdMessagesMessageIdRetry: jest.fn(),
}));

const getSessionsMock = jest.mocked(getApiSessions);
const getMessagesMock = jest.mocked(getApiSessionsSessionIdMessages);
const createSessionMock = jest.mocked(postApiSessions);
const sendMessageMock = jest.mocked(postApiSessionsSessionIdMessages);
const retryMessageMock = jest.mocked(postApiSessionsSessionIdMessagesMessageIdRetry);

const session = {
  sessionId: "session-1",
  petId: "pet-1",
  petType: PetType.Dog,
  createdAt: "2026-07-15T10:00:00Z",
  updatedAt: "2026-07-15T10:00:00Z",
};

const firstPage: SessionMessagesPageResponseDto = {
  sessionId: "session-1",
  items: [
    {
      messageId: "message-2",
      role: ChatMessageRole.assistant,
      content: "Latest",
      createdAt: "2026-07-15T10:02:00Z",
    },
  ],
  pagination: { limit: 1, hasMore: true, nextCursor: "older" },
};

const wrapper = (queryClient: QueryClient) =>
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

const queryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
      mutations: { gcTime: Infinity, retry: false },
    },
  });

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("assistant query hooks", () => {
  it("loads cursor pages with the active session ID and stops when exhausted", async () => {
    getMessagesMock.mockResolvedValueOnce(apiResponse(firstPage)).mockResolvedValueOnce(
      apiResponse({
        sessionId: "session-1",
        items: [
          {
            messageId: "message-1",
            role: ChatMessageRole.user,
            content: "Older",
            createdAt: "2026-07-15T10:01:00Z",
          },
        ],
        pagination: { limit: 1, hasMore: false, nextCursor: null },
      })
    );
    const client = queryClient();
    const { result } = renderHook(() => useAssistantMessagesQuery("session-1", true), {
      wrapper: wrapper(client),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMessagesMock).toHaveBeenCalledWith(
      "session-1",
      { limit: 8 },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });
    expect(getMessagesMock).toHaveBeenLastCalledWith(
      "session-1",
      { limit: 8, cursor: "older" },
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    await waitFor(() => {
      expect(result.current.messages.map((message) => message.content)).toEqual([
        "Older",
        "Latest",
      ]);
      expect(result.current.hasNextPage).toBe(false);
    });
  });

  it("creates a session, updates the session cache, and seeds empty history", async () => {
    createSessionMock.mockResolvedValue(apiResponse(session));
    const client = queryClient();
    const { result } = renderHook(() => useCreateAssistantSessionMutation(), {
      wrapper: wrapper(client),
    });

    await act(async () => {
      await result.current.mutateAsync("pet-1");
    });

    expect(createSessionMock).toHaveBeenCalledWith({ petId: "pet-1" });
    expect(client.getQueryData(assistantQueryKeys.sessions())).toEqual([session]);
    expect(client.getQueryData(assistantQueryKeys.messages("session-1"))).toMatchObject({
      pages: [{ sessionId: "session-1", items: [] }],
      pageParams: [""],
    });
  });

  it("keeps loaded messages visible when a background refetch fails", async () => {
    getMessagesMock.mockResolvedValueOnce(apiResponse(firstPage));
    const client = queryClient();
    const { result } = renderHook(() => useAssistantMessagesQuery("session-1", true), {
      wrapper: wrapper(client),
    });
    await waitFor(() => expect(result.current.messages).toHaveLength(1));
    getMessagesMock.mockRejectedValueOnce(new Error("offline"));

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.messages.map((message) => message.content)).toEqual(["Latest"]);
      expect(result.current.isRefetchError).toBe(true);
    });
  });

  it("sends and retries through their dedicated endpoints", async () => {
    const response = {
      answer: "Monitor closely",
      urgency: ClassifierUrgency.MONITOR,
      homeAdvice: ["Rest"],
      disclaimer: "General guidance",
      urgentContactEmergencyVet: false,
    };
    sendMessageMock.mockResolvedValue(apiResponse(response));
    retryMessageMock.mockResolvedValue(apiResponse(response));
    const client = queryClient();
    const send = renderHook(() => useSendAssistantMessageMutation(), {
      wrapper: wrapper(client),
    });
    const retry = renderHook(() => useRetryAssistantMessageMutation(), {
      wrapper: wrapper(client),
    });

    await act(async () => {
      await send.result.current.mutateAsync({ sessionId: "session-1", text: "Question" });
      await retry.result.current.mutateAsync({
        sessionId: "session-1",
        messageId: "message-1",
      });
    });

    expect(sendMessageMock).toHaveBeenCalledWith("session-1", {
      clientMessageId: "test-client-message-id",
      text: "Question",
    });
    expect(retryMessageMock).toHaveBeenCalledWith("session-1", "message-1");
  });
});

describe("assistant session bootstrap", () => {
  it("selects the latest existing session without creating another", async () => {
    getSessionsMock.mockResolvedValue(
      apiResponse([
        { ...session, sessionId: "older", updatedAt: "2026-07-15T09:00:00Z" },
        { ...session, sessionId: "latest", updatedAt: "2026-07-15T11:00:00Z" },
      ])
    );
    const client = queryClient();
    const { result } = renderHook(() => useAssistantSessionBootstrap("pet-1", true), {
      wrapper: wrapper(client),
    });

    await waitFor(() => expect(result.current.activeSession?.sessionId).toBe("latest"));
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("serializes first-session creation and ignores stale pet completion", async () => {
    getSessionsMock.mockResolvedValue(apiResponse([]));
    const createResolvers = new Map<
      string,
      (value: AxiosResponse<ChatSessionResponseDto>) => void
    >();
    createSessionMock.mockImplementation(
      ({ petId }) =>
        new Promise<AxiosResponse<ChatSessionResponseDto>>((resolve) => {
          createResolvers.set(petId, resolve);
        })
    );
    const client = queryClient();
    const { result, rerender } = renderHook(
      ({ petId }: { petId: string }) => useAssistantSessionBootstrap(petId, true),
      { initialProps: { petId: "pet-1" }, wrapper: wrapper(client) }
    );

    await waitFor(() => expect(createSessionMock).toHaveBeenCalledTimes(1));
    rerender({ petId: "pet-2" });
    const resolveFirstCreate = createResolvers.get("pet-1");
    if (!resolveFirstCreate) throw new Error("Missing pet-1 session resolver");
    resolveFirstCreate(apiResponse(session));

    await waitFor(() => expect(result.current.activeSession).toBeNull());
    await waitFor(() => expect(createSessionMock).toHaveBeenCalledTimes(2));

    const resolveSecondCreate = createResolvers.get("pet-2");
    if (!resolveSecondCreate) throw new Error("Missing pet-2 session resolver");
    resolveSecondCreate(apiResponse({ ...session, sessionId: "session-2", petId: "pet-2" }));
    await waitFor(() => expect(result.current.activeSession?.sessionId).toBe("session-2"));
  });

  it("allows an explicit retry after first-session creation fails", async () => {
    getSessionsMock.mockResolvedValue(apiResponse([]));
    createSessionMock
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(apiResponse(session));
    const client = queryClient();
    const { result } = renderHook(() => useAssistantSessionBootstrap("pet-1", true), {
      wrapper: wrapper(client),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.activeSession?.sessionId).toBe("session-1"));
    expect(createSessionMock).toHaveBeenCalledTimes(2);
  });
});
