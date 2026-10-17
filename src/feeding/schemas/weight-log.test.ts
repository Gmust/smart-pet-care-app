/// <reference types="jest" />

import type { TFunction } from "i18next";

import { weightLogSchema } from "./weight-log.schema";

// Passthrough so assertions can match on the translation key itself. See the
// note in feeding-log.test.ts for why the cast is unavoidable.
const t = ((key: string) => key) as unknown as TFunction<["feeding", "common"]>;

const schema = weightLogSchema(t);

const valid = {
  weightKg: "4.1",
  measuredAt: "2026-10-08T10:00:00.000Z",
  notes: "",
};

const firstMessage = (result: ReturnType<typeof schema.safeParse>): string | undefined =>
  result.success ? undefined : result.error.issues[0]?.message;

describe("weightLogSchema", () => {
  it("accepts a measurement", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("requires a weight", () => {
    expect(firstMessage(schema.safeParse({ ...valid, weightKg: "" }))).toBe(
      "feeding:forms.weight.errors.weightRequired"
    );
  });

  it("rejects a non-positive or non-numeric weight", () => {
    expect(firstMessage(schema.safeParse({ ...valid, weightKg: "0" }))).toBe(
      "feeding:forms.weight.errors.weightInvalid"
    );
    expect(firstMessage(schema.safeParse({ ...valid, weightKg: "-1" }))).toBe(
      "feeding:forms.weight.errors.weightInvalid"
    );
    expect(firstMessage(schema.safeParse({ ...valid, weightKg: "heavy" }))).toBe(
      "feeding:forms.weight.errors.weightInvalid"
    );
  });

  it("requires a date and rejects the future", () => {
    expect(firstMessage(schema.safeParse({ ...valid, measuredAt: "" }))).toBe(
      "feeding:forms.weight.errors.measuredAtRequired"
    );

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(firstMessage(schema.safeParse({ ...valid, measuredAt: tomorrow }))).toBe(
      "feeding:forms.weight.errors.measuredAtFuture"
    );
  });

  it("accepts a decimal weight, which is the normal case for a cat", () => {
    expect(schema.safeParse({ ...valid, weightKg: "4.15" }).success).toBe(true);
  });

  it("accepts a decimal comma", () => {
    expect(schema.safeParse({ ...valid, weightKg: "4,5" }).success).toBe(true);
  });

  it("ignores spaces around the weight", () => {
    expect(schema.safeParse({ ...valid, weightKg: " 4.1 " }).success).toBe(true);
  });

  it("accepts only a plain decimal weight, not exponents, hex or a bare dot", () => {
    for (const weightKg of ["1e3", "0x10", ".5", "5."]) {
      expect(firstMessage(schema.safeParse({ ...valid, weightKg }))).toBe(
        "feeding:forms.weight.errors.weightInvalid"
      );
    }
  });
});
