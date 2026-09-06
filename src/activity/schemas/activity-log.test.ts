/// <reference types="jest" />

import type { TFunction } from "i18next";

import { ActivityIntensity, ActivityType } from "@/api/generated";

import { activityLogSchema } from "./activity-log.schema";

// Passthrough so assertions can match on the translation key itself.
// `as unknown as TFunction` is unavoidable here: TFunction's overloads model the
// full i18next key/interpolation surface, which a one-line identity stub cannot
// structurally satisfy. Mirrors the existing repo test convention.
const t = ((key: string) => key) as unknown as TFunction<["activity", "common"]>;

const schema = activityLogSchema(t);

const valid = {
  type: ActivityType.Walk,
  recordedAt: "2026-09-01T09:00:00.000Z",
  intensity: ActivityIntensity.Moderate,
  durationMinutes: "30",
  steps: "2400",
  locationLabel: "Riverside Park",
  note: "Good pace",
};

const firstMessage = (result: ReturnType<typeof schema.safeParse>): string | undefined =>
  result.success ? undefined : result.error.issues[0]?.message;

describe("activityLogSchema", () => {
  it("accepts a fully populated activity", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("accepts every optional field left blank", () => {
    const result = schema.safeParse({
      ...valid,
      intensity: "",
      durationMinutes: "",
      steps: "",
      locationLabel: "",
      note: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing type", () => {
    const result = schema.safeParse({ ...valid, type: "" });
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe("activity:forms.activity.errors.typeRequired");
  });

  it("rejects a missing recordedAt", () => {
    const result = schema.safeParse({ ...valid, recordedAt: "" });
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe("activity:forms.activity.errors.recordedAtRequired");
  });

  it("rejects a future recordedAt", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const result = schema.safeParse({ ...valid, recordedAt: future });
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe("activity:forms.activity.errors.recordedAtFuture");
  });

  it("accepts a recordedAt in the past", () => {
    const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(schema.safeParse({ ...valid, recordedAt: past }).success).toBe(true);
  });

  it("rejects a negative duration", () => {
    const result = schema.safeParse({ ...valid, durationMinutes: "-5" });
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe("activity:forms.activity.errors.durationInvalid");
  });

  it("rejects a non-numeric duration", () => {
    const result = schema.safeParse({ ...valid, durationMinutes: "thirty" });
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe("activity:forms.activity.errors.durationInvalid");
  });

  it("rejects a fractional duration", () => {
    expect(schema.safeParse({ ...valid, durationMinutes: "12.5" }).success).toBe(false);
  });

  it("rejects negative and non-numeric steps", () => {
    expect(schema.safeParse({ ...valid, steps: "-1" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, steps: "lots" }).success).toBe(false);
  });

  it("accepts zero for numeric fields", () => {
    expect(schema.safeParse({ ...valid, durationMinutes: "0", steps: "0" }).success).toBe(true);
  });

  it("rejects an intensity outside the enum", () => {
    expect(schema.safeParse({ ...valid, intensity: "Extreme" }).success).toBe(false);
  });

  it("rejects a type outside the enum", () => {
    expect(schema.safeParse({ ...valid, type: "Skydiving" }).success).toBe(false);
  });

  describe("requireIntensity (edit mode)", () => {
    const editSchema = activityLogSchema(t, { requireIntensity: true });

    it("accepts an intensity that is set", () => {
      expect(editSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects a blank intensity", () => {
      const result = editSchema.safeParse({ ...valid, intensity: "" });
      expect(result.success).toBe(false);
      expect(firstMessage(result)).toBe("activity:forms.activity.errors.intensityRequired");
    });

    it("still allows a blank intensity when creating", () => {
      expect(schema.safeParse({ ...valid, intensity: "" }).success).toBe(true);
    });
  });
});
