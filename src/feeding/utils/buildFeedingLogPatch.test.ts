/// <reference types="jest" />

import type { FeedingLogResponseDto } from "@/api/generated";
import { FoodType, PortionUnit } from "@/api/generated";

import type { FeedingLogFormValues } from "../schemas/feeding-log.schema";

import { buildFeedingLogPatch } from "./buildFeedingLogPatch";

const log: FeedingLogResponseDto = {
  id: "log-1",
  petId: "pet-1",
  fedAt: "2026-10-08T08:05:00.000Z",
  foodType: FoodType.DryFood,
  foodName: "Royal Canin Renal",
  portionAmount: 85,
  portionUnit: PortionUnit.Gram,
  approxCalories: 170,
  notes: "morning",
  createdAt: "2026-10-08T08:05:00.000Z",
};

const formFor = (overrides: Partial<FeedingLogFormValues> = {}): FeedingLogFormValues => ({
  fedAt: log.fedAt ?? "",
  foodType: FoodType.DryFood,
  foodName: "Royal Canin Renal",
  portionAmount: "85",
  portionUnit: PortionUnit.Gram,
  approxCalories: "170",
  notes: "morning",
  ...overrides,
});

describe("buildFeedingLogPatch", () => {
  it("sends nothing when nothing changed", () => {
    expect(buildFeedingLogPatch(formFor(), log)).toEqual({});
  });

  it("does not resend numeric fields the API returned as numbers but the form holds as strings", () => {
    const dto = buildFeedingLogPatch(formFor(), log);

    expect(dto).not.toHaveProperty("portionAmount");
    expect(dto).not.toHaveProperty("approxCalories");
  });

  it("treats a numeric string from the API as equal to the same form value", () => {
    const stringy = { ...log, portionAmount: "85", approxCalories: "170" };

    expect(buildFeedingLogPatch(formFor(), stringy)).toEqual({});
  });

  it("sends only the field that changed", () => {
    expect(buildFeedingLogPatch(formFor({ approxCalories: "200" }), log)).toEqual({
      approxCalories: 200,
    });
  });

  it("clears an emptied optional text field with null", () => {
    expect(buildFeedingLogPatch(formFor({ notes: "" }), log)).toEqual({ notes: null });
    expect(buildFeedingLogPatch(formFor({ notes: "   " }), log)).toEqual({ notes: null });
  });

  it("clears an emptied numeric field with null rather than zero", () => {
    expect(buildFeedingLogPatch(formFor({ approxCalories: "" }), log)).toEqual({
      approxCalories: null,
    });
  });

  it("ignores whitespace-only changes to text fields", () => {
    expect(buildFeedingLogPatch(formFor({ foodName: "  Royal Canin Renal  " }), log)).toEqual({});
  });

  it("sends a changed enum but never clears one", () => {
    expect(buildFeedingLogPatch(formFor({ foodType: FoodType.Treat }), log)).toEqual({
      foodType: FoodType.Treat,
    });
    expect(buildFeedingLogPatch(formFor({ foodType: "" }), log)).toEqual({});
    expect(buildFeedingLogPatch(formFor({ portionUnit: "" }), log)).toEqual({});
  });

  it("never clears a stored portion, because PatchFieldOfdecimal has no null", () => {
    expect(buildFeedingLogPatch(formFor({ portionAmount: "" }), log)).toEqual({});
  });

  it("sends a changed portion unit", () => {
    expect(buildFeedingLogPatch(formFor({ portionUnit: PortionUnit.Cup }), log)).toEqual({
      portionUnit: PortionUnit.Cup,
    });
  });

  it("sends a changed time", () => {
    const fedAt = "2026-10-08T09:30:00.000Z";

    expect(buildFeedingLogPatch(formFor({ fedAt }), log)).toEqual({ fedAt });
  });

  it("fills fields that were absent on the stored log", () => {
    const bare: FeedingLogResponseDto = {
      id: "log-2",
      petId: "pet-1",
      fedAt: log.fedAt,
      foodType: FoodType.DryFood,
      createdAt: log.createdAt,
    };

    expect(buildFeedingLogPatch(formFor({ notes: "", foodName: "" }), bare)).toEqual({
      portionAmount: 85,
      portionUnit: PortionUnit.Gram,
      approxCalories: 170,
    });
  });

  it("drops a unit that has no amount, as create does", () => {
    const bare: FeedingLogResponseDto = {
      id: "log-3",
      petId: "pet-1",
      fedAt: log.fedAt,
      foodType: FoodType.DryFood,
      createdAt: log.createdAt,
    };

    expect(
      buildFeedingLogPatch(
        formFor({
          foodName: "",
          notes: "",
          portionAmount: "",
          portionUnit: PortionUnit.Gram,
          approxCalories: "",
        }),
        bare
      )
    ).toEqual({});
  });
});
