/// <reference types="jest" />

import type { TFunction } from "i18next";

import { createPetSchema, editPetSchema } from "./create-pet.schema";

// The cast: the schema only calls `t(key)`; a stub cannot satisfy the full TFunction overloads.
const t = ((key: string) => key) as TFunction<"pets">;

const base = { name: "Miso", species: "Cat" };

describe("editPetSchema birthDate", () => {
  it.each([
    ["Z", "2025-11-13T00:00:00.000Z"],
    ["an offset", "2025-11-13T00:00:00+00:00"],
    ["no zone", "2025-11-13T00:00:00"],
    ["a non-zero offset", "2025-11-13T03:00:00+03:00"],
    ["no value", null],
  ])("accepts a date written with %s", (_label, birthDate) => {
    expect(editPetSchema(t).safeParse({ ...base, birthDate }).success).toBe(true);
  });

  it("rejects text that is not a date", () => {
    expect(editPetSchema(t).safeParse({ ...base, birthDate: "13.11.2025" }).success).toBe(false);
  });
});

describe("createPetSchema health lists", () => {
  it("drops blank rows, so the form can leave them in place until it is submitted", () => {
    const result = createPetSchema(t).parse({
      name: "Miso",
      species: "Cat",
      weightKg: "3",
      allergies: ["Chicken", "  ", ""],
      chronicConditions: ["", " "],
      behavioralNotes: [],
    });

    expect(result.allergies).toEqual(["Chicken"]);
    expect(result.chronicConditions).toBeNull();
  });
});
