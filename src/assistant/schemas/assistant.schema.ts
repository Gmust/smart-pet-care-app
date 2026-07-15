import { z } from "zod";

export const assistantUrgencySchema = z.enum(["MONITOR", "CONSULT_SOON", "URGENT", "EMERGENCY"]);

export const chatModeSchema = z.enum(["general", "health", "emergency"]);

export const topKItemSchema = z.object({
  condition: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const chatPredictionSchema = z.object({
  predictedCondition: z.string().min(1),
  confidence: z.number().min(0).max(1),
  topK: z.array(topKItemSchema),
  urgency: assistantUrgencySchema,
  specialist: z.string().min(1),
  diseaseCategory: z.string().min(1),
  homeAdvice: z.array(z.string().min(1)),
});

export const assistantChatResponseSchema = z.object({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  mode: chatModeSchema,
  answer: z.string().min(1),
  prediction: chatPredictionSchema.nullable(),
  relatedTopics: z.array(z.string().min(1)),
  needsClarification: z.boolean(),
  disclaimer: z.string().min(1),
});

export const assistantChatRequestSchema = z.object({
  conversationId: z.string().min(1).optional(),
  petId: z.string().min(1).optional(),
  message: z.string().trim().min(1).max(4000),
});

export const assistantMessageSchema = z.discriminatedUnion("sender", [
  z.object({ id: z.string().min(1), sender: z.literal("user"), text: z.string().trim().min(1) }),
  z.object({
    id: z.string().min(1),
    sender: z.literal("assistant"),
    requestId: z.string().min(1),
    status: z.enum(["pending", "complete", "failed"]),
    response: assistantChatResponseSchema.optional(),
    failure: z.enum(["unavailable", "invalid-response", "cancelled"]).optional(),
  }),
]);

export const assistantConsentSchema = z.boolean();

export const assistantPersistedStateSchema = z.object({
  version: z.literal(2),
  consent: assistantConsentSchema.nullable(),
  selectedPetId: z.string().min(1).nullable(),
  conversationId: z.string().nullable(),
  messages: z.array(assistantMessageSchema),
});

export const assistantRouteParamsSchema = z.object({ petId: z.string().trim().min(1).optional() });

export type AssistantChatResponse = z.infer<typeof assistantChatResponseSchema>;
export type AssistantChatRequest = z.infer<typeof assistantChatRequestSchema>;
export type AssistantChatPrediction = z.infer<typeof chatPredictionSchema>;
export type ChatMode = z.infer<typeof chatModeSchema>;
export type AssistantMessage = z.infer<typeof assistantMessageSchema>;
export type AssistantPersistedState = z.infer<typeof assistantPersistedStateSchema>;
export type AssistantUrgency = z.infer<typeof assistantUrgencySchema>;
