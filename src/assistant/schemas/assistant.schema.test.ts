/// <reference types="jest" />

import { assistantChatResponseSchema, assistantPersistedStateSchema } from "./assistant.schema";

const validResponse = {
  messageId: "msg-1",
  conversationId: "conv-1",
  mode: "health",
  answer: "Answer text",
  prediction: {
    predictedCondition: "Condition",
    confidence: 0.8,
    topK: [{ condition: "Condition", confidence: 0.8 }],
    urgency: "MONITOR",
    specialist: "general-practice",
    diseaseCategory: "wellness",
    homeAdvice: ["Advice"],
  },
  relatedTopics: [],
  needsClarification: false,
  disclaimer: "Disclaimer",
};

describe("assistantChatResponseSchema", () => {
  it("accepts a valid wrapper response", () => {
    expect(assistantChatResponseSchema.safeParse(validResponse).success).toBe(true);
  });

  it("accepts a general response with a null prediction", () => {
    expect(
      assistantChatResponseSchema.safeParse({
        ...validResponse,
        mode: "general",
        prediction: null,
        relatedTopics: ["Topic"],
      }).success
    ).toBe(true);
  });

  it("rejects an unknown mode", () => {
    expect(
      assistantChatResponseSchema.safeParse({ ...validResponse, mode: "unknown" }).success
    ).toBe(false);
  });

  it("rejects an unknown urgency", () => {
    expect(
      assistantChatResponseSchema.safeParse({
        ...validResponse,
        prediction: { ...validResponse.prediction, urgency: "unknown" },
      }).success
    ).toBe(false);
  });

  it("accepts an unrecognized specialist or disease category (forward-compatible)", () => {
    expect(
      assistantChatResponseSchema.safeParse({
        ...validResponse,
        prediction: {
          ...validResponse.prediction,
          specialist: "future-specialty",
          diseaseCategory: "future-category",
        },
      }).success
    ).toBe(true);
  });
});

describe("assistantPersistedStateSchema", () => {
  it("rejects version 1 payloads", () => {
    expect(
      assistantPersistedStateSchema.safeParse({
        version: 1,
        consent: null,
        selectedPetId: null,
        messages: [],
      }).success
    ).toBe(false);
  });

  it("accepts a valid version 2 payload", () => {
    expect(
      assistantPersistedStateSchema.safeParse({
        version: 2,
        consent: null,
        selectedPetId: null,
        conversationId: null,
        messages: [],
      }).success
    ).toBe(true);
  });
});
