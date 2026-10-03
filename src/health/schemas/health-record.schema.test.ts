/// <reference types="jest" />

import type { TFunction } from "i18next";

import { HealthRecordType } from "@/api/generated";

import { healthRecordSchema } from "./health-record.schema";
import {
  formCategorySchema,
  healthRecordListParamsSchema,
} from "./health-record-list-params.schema";

// Passthrough so assertions can match on the translation key itself.
// `as unknown as TFunction` is unavoidable here: TFunction's overloads model the
// full i18next key/interpolation surface, which a one-line identity stub cannot
// structurally satisfy. Mirrors the existing repo test convention.
const t = ((key: string) => key) as unknown as TFunction<["health", "common"]>;

const schema = healthRecordSchema(t);

const PET_ID = "8f1a4f0e-4b4a-4d0a-9d0e-2f1b7c3a5d61";

const valid = {
  petId: PET_ID,
  type: HealthRecordType.VetVisit,
  title: "Annual check-up",
  performedAt: "2026-09-01T09:00:00.000Z",
  description: "",
  nextDueAt: "",
  dosage: "",
  provider: "",
  symptoms: [],
};

const firstMessage = (result: ReturnType<typeof schema.safeParse>): string | undefined =>
  result.success ? undefined : result.error.issues[0]?.message;

describe("health category tuples", () => {
  it("only lets the form edit the types it can create", () => {
    expect(formCategorySchema.safeParse(HealthRecordType.Symptom).success).toBe(true);
    // Backend-only types must not be narrowed into the form.
    expect(formCategorySchema.safeParse(HealthRecordType.Medication).success).toBe(false);
    expect(formCategorySchema.safeParse(HealthRecordType.Surgery).success).toBe(false);
    expect(formCategorySchema.safeParse(HealthRecordType.HealthNote).success).toBe(false);
    expect(formCategorySchema.safeParse(undefined).success).toBe(false);
  });
});

describe("healthRecordSchema", () => {
  it("accepts a symptom record", () => {
    expect(schema.safeParse({ ...valid, type: HealthRecordType.Symptom }).success).toBe(true);
  });

  it("reports an unchosen type instead of accepting the empty placeholder", () => {
    expect(firstMessage(schema.safeParse({ ...valid, type: "" }))).toBe(
      "health:forms.healthRecord.errors.typeRequired"
    );
  });
});

describe("healthRecordListParamsSchema", () => {
  it("routes to Symptom records, not only the history tiles", () => {
    // Without this the Symptoms row has nowhere to go and logged symptoms can
    // never be viewed, edited or deleted.
    expect(
      healthRecordListParamsSchema.safeParse({ petId: PET_ID, type: HealthRecordType.Symptom })
        .success
    ).toBe(true);
  });

  it("rejects backend-only types the list and form cannot handle", () => {
    expect(
      healthRecordListParamsSchema.safeParse({ petId: PET_ID, type: HealthRecordType.Medication })
        .success
    ).toBe(false);
  });
});
