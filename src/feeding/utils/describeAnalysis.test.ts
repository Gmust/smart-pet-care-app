import { describeAnalysis } from "./describeAnalysis";

describe("describeAnalysis", () => {
  it("reads numbers the API sent as strings and rounds them", () => {
    const result = describeAnalysis({
      date: "2026-09-12",
      actualCalories: "405.40",
      targetCalories: "420.00",
      deviationPct: "-3.57",
      mealCount: "18",
    });

    expect(result).toEqual({
      actual: 405,
      target: 420,
      deviationLabel: "−4%",
      mealCount: 18,
      dateLabel: "Sep 12",
    });
  });

  it("signs an excess with a plus and leaves a zero deviation unsigned", () => {
    expect(describeAnalysis({ deviationPct: 12.4 }).deviationLabel).toBe("+12%");
    expect(describeAnalysis({ deviationPct: 0.2 }).deviationLabel).toBe("0%");
  });

  it("falls back to zero for a field the API left out", () => {
    expect(describeAnalysis({})).toMatchObject({ actual: 0, target: 0, mealCount: 0 });
  });

  it("rounds to the nearest whole number, not down", () => {
    const result = describeAnalysis({
      actualCalories: "404.6",
      targetCalories: "420.5",
      deviationPct: "-3.4",
    });

    expect(result).toMatchObject({ actual: 405, target: 421, deviationLabel: "−3%" });
    expect(describeAnalysis({ deviationPct: 3.6 }).deviationLabel).toBe("+4%");
  });
});
