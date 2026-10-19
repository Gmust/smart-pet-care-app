import type { FeedingLogResponseDto, NutritionAnalysisResponseDto } from "@/api/generated";

import { hasNewLogsSince } from "./hasNewLogsSince";

const analysis: NutritionAnalysisResponseDto = {
  date: "2026-10-11",
  createdAt: "2026-10-11T12:00:00.000Z",
};

const log = (overrides: Partial<FeedingLogResponseDto>): FeedingLogResponseDto => ({
  fedAt: "2026-10-11T08:00:00.000Z",
  createdAt: "2026-10-11T08:05:00.000Z",
  ...overrides,
});

describe("hasNewLogsSince", () => {
  it("is false when every meal of the day was logged before the analysis ran", () => {
    expect(hasNewLogsSince([log({})], analysis)).toBe(false);
  });

  it("is true for a meal of that day logged after the analysis ran", () => {
    expect(hasNewLogsSince([log({ createdAt: "2026-10-11T13:00:00.000Z" })], analysis)).toBe(true);
  });

  it("is true for a meal edited after the analysis ran", () => {
    expect(hasNewLogsSince([log({ updatedAt: "2026-10-11T13:00:00.000Z" })], analysis)).toBe(true);
  });

  it("ignores a meal backdated to another day", () => {
    const backdated = log({
      fedAt: "2026-10-08T08:00:00.000Z",
      createdAt: "2026-10-11T13:00:00.000Z",
    });

    expect(hasNewLogsSince([backdated], analysis)).toBe(false);
  });

  it("is false without any meals", () => {
    expect(hasNewLogsSince([], analysis)).toBe(false);
  });
});
