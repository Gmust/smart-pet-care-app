/// <reference types="jest" />

import { ActivityIntensity, type ActivityLogResponseDto, ActivityType } from "@/api/generated";

import { filterActivities } from "./filterActivities";

const walkLow: ActivityLogResponseDto = {
  id: "walk-low",
  type: ActivityType.Walk,
  intensity: ActivityIntensity.Low,
};
const runHigh: ActivityLogResponseDto = {
  id: "run-high",
  type: ActivityType.Run,
  intensity: ActivityIntensity.High,
};
const noType: ActivityLogResponseDto = {
  id: "no-type",
  type: null,
  intensity: ActivityIntensity.Low,
};
const noIntensity: ActivityLogResponseDto = {
  id: "no-intensity",
  type: ActivityType.Walk,
  intensity: null,
};

const all = [walkLow, runHigh, noType, noIntensity];
const noFilters = { types: [], intensities: [] };

describe("filterActivities", () => {
  it("returns everything when no filter is active", () => {
    expect(filterActivities(all, noFilters)).toEqual(all);
  });

  it("handles empty and undefined input", () => {
    expect(filterActivities([], noFilters)).toEqual([]);
    expect(filterActivities(undefined, noFilters)).toEqual([]);
    expect(filterActivities(undefined, { types: [ActivityType.Walk], intensities: [] })).toEqual(
      []
    );
  });

  it("filters by a single type", () => {
    const result = filterActivities(all, { types: [ActivityType.Walk], intensities: [] });
    expect(result.map((a) => a.id)).toEqual(["walk-low", "no-intensity"]);
  });

  it("filters by multiple types", () => {
    const result = filterActivities(all, {
      types: [ActivityType.Walk, ActivityType.Run],
      intensities: [],
    });
    expect(result.map((a) => a.id)).toEqual(["walk-low", "run-high", "no-intensity"]);
  });

  it("filters by intensity", () => {
    const result = filterActivities(all, { types: [], intensities: [ActivityIntensity.Low] });
    expect(result.map((a) => a.id)).toEqual(["walk-low", "no-type"]);
  });

  it("excludes entries with a null type while a type filter is active", () => {
    const result = filterActivities(all, { types: [ActivityType.Walk], intensities: [] });
    expect(result.map((a) => a.id)).not.toContain("no-type");
  });

  it("excludes entries with a null intensity while an intensity filter is active", () => {
    const result = filterActivities(all, { types: [], intensities: [ActivityIntensity.Low] });
    expect(result.map((a) => a.id)).not.toContain("no-intensity");
  });

  it("applies type and intensity together", () => {
    const result = filterActivities(all, {
      types: [ActivityType.Walk],
      intensities: [ActivityIntensity.Low],
    });
    expect(result.map((a) => a.id)).toEqual(["walk-low"]);
  });

  it("returns nothing when filters exclude everything", () => {
    const result = filterActivities(all, {
      types: [ActivityType.Swimming],
      intensities: [ActivityIntensity.High],
    });
    expect(result).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const input = [...all];
    filterActivities(input, { types: [ActivityType.Walk], intensities: [] });
    expect(input).toEqual(all);
  });
});
