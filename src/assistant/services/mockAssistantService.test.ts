/// <reference types="jest" />

import { emergencyResponse, genericHealthResponse } from "./fixtures";
import { hasEmergencyIndicator, mockAssistantService } from "./mockAssistantService";

const request = (userText: string, signal?: AbortSignal) => ({
  requestId: "request-1",
  locale: "en",
  pet: { id: "pet-1", name: "Milo", species: "dog" },
  messages: [],
  conversationId: null,
  userText,
  signal,
});

describe("mockAssistantService", () => {
  it("selects deterministic fixtures", async () => {
    const first = await mockAssistantService.assess(request("Routine checkup"));
    const second = await mockAssistantService.assess(request(" routine   CHECKUP "));
    expect(second).toEqual(first);
  });

  it.each([
    ["food and training tips", "general"],
    ["routine checkup", "health"],
    ["itch and appetite change", "health"],
    ["limping and vomiting", "health"],
    ["not sure, comes and goes", "health"],
  ] as const)("covers the %s fixture branch", async (text, mode) => {
    const result = await mockAssistantService.assess(request(text));
    expect(result.kind).toBe("response");
    if (result.kind === "response") expect(result.response.mode).toBe(mode);
  });

  it("uses the generic fallback for unmatched input", async () => {
    expect(await mockAssistantService.assess(request("something unmatched"))).toEqual({
      kind: "response",
      response: genericHealthResponse,
    });
  });

  it("overrides routine input for emergencies via local indicator", async () => {
    expect(hasEmergencyIndicator("My pet cannot breathe after a routine checkup")).toBe(true);
    expect(await mockAssistantService.assess(request("My pet cannot breathe"))).toEqual({
      kind: "response",
      response: emergencyResponse,
    });
  });

  it("returns the emergency fixture for the emergency trigger", async () => {
    expect(await mockAssistantService.assess(request("fixture:emergency"))).toEqual({
      kind: "response",
      response: emergencyResponse,
    });
  });

  it("returns typed failure fixtures", async () => {
    expect(await mockAssistantService.assess(request("fixture:failure"))).toEqual({
      kind: "failure",
      failure: "unavailable",
    });
    expect(await mockAssistantService.assess(request("fixture:malformed"))).toEqual({
      kind: "failure",
      failure: "invalid-response",
    });
  });

  it("honors cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    expect(await mockAssistantService.assess(request("checkup", controller.signal))).toEqual({
      kind: "failure",
      failure: "cancelled",
    });
  });
});
