/// <reference types="jest" />

import type { TFunction } from "i18next";

import { PortionUnit } from "@/api/generated";

import { nutritionGoalSchema } from "./nutrition-goal.schema";

// Passthrough so assertions can match on the translation key itself. See the
// note in feeding-log.test.ts for why the cast is unavoidable.
const t = ((key: string) => key) as unknown as TFunction<["feeding", "common"]>;

const schema = nutritionGoalSchema(t);

const valid = {
  dailyCalorieTarget: "420",
  dailyPortionTarget: "200",
  portionUnit: PortionUnit.Gram,
  mealsPerDay: "3",
};

const firstMessage = (result: ReturnType<typeof schema.safeParse>): string | undefined =>
  result.success ? undefined : result.error.issues[0]?.message;

describe("nutritionGoalSchema", () => {
  it("accepts a fully filled goal", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("accepts a goal that sets only calories", () => {
    const result = schema.safeParse({
      dailyCalorieTarget: "420",
      dailyPortionTarget: "",
      portionUnit: "",
      mealsPerDay: "",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a goal that sets only meals per day", () => {
    const result = schema.safeParse({
      dailyCalorieTarget: "",
      dailyPortionTarget: "",
      portionUnit: "",
      mealsPerDay: "3",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an all-blank goal rather than storing a target of nothing", () => {
    expect(
      firstMessage(
        schema.safeParse({
          dailyCalorieTarget: "",
          dailyPortionTarget: "",
          portionUnit: "",
          mealsPerDay: "",
        })
      )
    ).toBe("feeding:forms.goal.errors.empty");
  });

  it("rejects a portion target with no unit", () => {
    expect(firstMessage(schema.safeParse({ ...valid, portionUnit: "" }))).toBe(
      "feeding:forms.goal.errors.portionUnitRequired"
    );
  });

  it("rejects zero and fractional meals per day", () => {
    expect(firstMessage(schema.safeParse({ ...valid, mealsPerDay: "0" }))).toBe(
      "feeding:forms.goal.errors.mealsInvalid"
    );
    expect(firstMessage(schema.safeParse({ ...valid, mealsPerDay: "2.5" }))).toBe(
      "feeding:forms.goal.errors.mealsInvalid"
    );
  });

  it("rejects a zero calorie target, which would divide the progress bar by zero", () => {
    expect(firstMessage(schema.safeParse({ ...valid, dailyCalorieTarget: "0" }))).toBe(
      "feeding:forms.goal.errors.calorieInvalid"
    );
  });

  it("accepts a decimal comma in the portion target", () => {
    expect(schema.safeParse({ ...valid, dailyPortionTarget: "150,5" }).success).toBe(true);
  });

  it("ignores spaces around a number", () => {
    expect(
      schema.safeParse({ ...valid, dailyCalorieTarget: " 420 ", dailyPortionTarget: " 150 " })
        .success
    ).toBe(true);
  });

  it("treats spaces-only fields as blank, so a goal of spaces is still empty", () => {
    expect(
      firstMessage(
        schema.safeParse({
          dailyCalorieTarget: "  ",
          dailyPortionTarget: "  ",
          portionUnit: "",
          mealsPerDay: "  ",
        })
      )
    ).toBe("feeding:forms.goal.errors.empty");
    expect(
      schema.safeParse({
        dailyCalorieTarget: "420",
        dailyPortionTarget: "  ",
        portionUnit: "",
        mealsPerDay: "",
      }).success
    ).toBe(true);
  });

  it("accepts only a plain positive decimal as a portion target", () => {
    for (const dailyPortionTarget of ["0", "1e3", "0x10", ".5", "5."]) {
      expect(firstMessage(schema.safeParse({ ...valid, dailyPortionTarget }))).toBe(
        "feeding:forms.goal.errors.portionInvalid"
      );
    }
  });
});
