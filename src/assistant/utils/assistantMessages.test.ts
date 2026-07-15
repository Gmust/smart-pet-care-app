/// <reference types="jest" />

import {
  ChatMessageRole,
  ChatMessageStatus,
  type ChatSessionResponseDto,
  PetType,
  type SessionMessagesPageResponseDto,
} from "@/api/generated";

import { mergeMessagePages, selectLatestPetSession } from "./assistantMessages";

const page = (items: SessionMessagesPageResponseDto["items"]): SessionMessagesPageResponseDto => ({
  sessionId: "session-1",
  items,
  pagination: { limit: 8, hasMore: false, nextCursor: null },
});

describe("assistant message adapters", () => {
  it("sorts chronologically, preserves roles/statuses, and deduplicates message IDs", () => {
    const messages = mergeMessagePages([
      page([
        {
          messageId: "assistant-2",
          role: ChatMessageRole.assistant,
          status: ChatMessageStatus.Completed,
          content: "Second",
          createdAt: "2026-07-15T10:02:00Z",
        },
        {
          messageId: "user-1",
          role: ChatMessageRole.user,
          content: "First",
          createdAt: "2026-07-15T10:01:00Z",
        },
      ]),
      page([
        {
          messageId: "assistant-2",
          role: ChatMessageRole.assistant,
          status: ChatMessageStatus.FailedRetryable,
          content: "Updated status",
          createdAt: "2026-07-15T10:02:00Z",
        },
      ]),
    ]);

    expect(messages).toHaveLength(2);
    expect(messages.map((message) => message.id)).toEqual(["user-1", "assistant-2"]);
    expect(messages[0]).toMatchObject({ role: ChatMessageRole.user, status: null });
    expect(messages[1]).toMatchObject({
      role: ChatMessageRole.assistant,
      status: ChatMessageStatus.FailedRetryable,
      content: "Updated status",
    });
  });

  it("uses updated time, created time, and session ID as deterministic session ordering", () => {
    const sessions: ChatSessionResponseDto[] = [
      {
        sessionId: "session-a",
        petId: "pet-1",
        petType: PetType.Dog,
        createdAt: "2026-07-15T08:00:00Z",
        updatedAt: "2026-07-15T09:00:00Z",
      },
      {
        sessionId: "session-b",
        petId: "pet-1",
        petType: PetType.Dog,
        createdAt: "2026-07-15T08:30:00Z",
        updatedAt: "2026-07-15T09:00:00Z",
      },
      {
        sessionId: "other-pet",
        petId: "pet-2",
        petType: PetType.Cat,
        createdAt: "2026-07-15T10:00:00Z",
        updatedAt: "2026-07-15T10:00:00Z",
      },
    ];

    expect(selectLatestPetSession(sessions, "pet-1")?.sessionId).toBe("session-b");
    expect(selectLatestPetSession(sessions, "missing")).toBeNull();
  });
});
