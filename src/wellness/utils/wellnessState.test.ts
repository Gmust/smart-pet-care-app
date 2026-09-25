import { ClassifierWellnessReasonCode } from "@/api/generated";

import { isWellnessStateOk } from "../constants";

import { parseWellnessScore } from "./parseWellnessScore";

describe("parseWellnessScore", () => {
  it("coerces the string form the spec allows", () => {
    expect(parseWellnessScore("72")).toBe(72);
    expect(parseWellnessScore(72)).toBe(72);
  });

  it("returns null for an absent or unusable score instead of 0", () => {
    expect(parseWellnessScore(null)).toBeNull();
    expect(parseWellnessScore(undefined)).toBeNull();
    expect(parseWellnessScore("")).toBeNull();
    expect(parseWellnessScore("n/a")).toBeNull();
  });

  it("keeps a real zero", () => {
    expect(parseWellnessScore(0)).toBe(0);
  });
});

describe("isWellnessStateOk", () => {
  it("treats healthy and not-applicable codes as ok", () => {
    expect(isWellnessStateOk(ClassifierWellnessReasonCode.ACTIVITY_TARGET_MET)).toBe(true);
    expect(isWellnessStateOk(ClassifierWellnessReasonCode.SLEEP_NOT_APPLICABLE)).toBe(true);
  });

  it("never shows missing data or a failed check as ok", () => {
    expect(isWellnessStateOk(ClassifierWellnessReasonCode.ACTIVITY_DATA_MISSING)).toBe(false);
    expect(isWellnessStateOk(ClassifierWellnessReasonCode.SYMPTOM_CLASSIFIER_FAILED)).toBe(false);
    expect(isWellnessStateOk(ClassifierWellnessReasonCode.SYMPTOM_RESULT_AVAILABLE)).toBe(false);
    expect(isWellnessStateOk(ClassifierWellnessReasonCode.BASELINE_NEEDS_ATTENTION)).toBe(false);
  });
});
