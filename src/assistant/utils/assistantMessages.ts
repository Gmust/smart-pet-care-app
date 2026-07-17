import type {
  ChatMessageResponseDto,
  ChatSessionResponseDto,
  SessionMessagesPageResponseDto,
} from "@/api/generated";

import type { ServerTranscriptMessage } from "../types";

const timestamp = (value: string): number => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const mapServerMessage = (message: ChatMessageResponseDto): ServerTranscriptMessage => ({
  kind: "server",
  id: message.messageId,
  messageId: message.messageId,
  role: message.role,
  status: message.status ?? null,
  content: message.content,
  createdAt: message.createdAt,
});

export const mergeMessagePages = (
  pages: SessionMessagesPageResponseDto[]
): ServerTranscriptMessage[] => {
  const uniqueMessages = new Map<string, ServerTranscriptMessage>();

  for (const page of pages) {
    for (const message of page.items ?? []) {
      uniqueMessages.set(message.messageId, mapServerMessage(message));
    }
  }

  return [...uniqueMessages.values()].sort(
    (left, right) =>
      timestamp(left.createdAt) - timestamp(right.createdAt) || left.id.localeCompare(right.id)
  );
};

export const selectLatestPetSession = (
  sessions: ChatSessionResponseDto[],
  petId: string
): ChatSessionResponseDto | null => {
  const matching = sessions.filter((session) => session.petId === petId);
  matching.sort(
    (left, right) =>
      timestamp(right.updatedAt) - timestamp(left.updatedAt) ||
      timestamp(right.createdAt) - timestamp(left.createdAt) ||
      right.sessionId.localeCompare(left.sessionId)
  );
  return matching[0] ?? null;
};
