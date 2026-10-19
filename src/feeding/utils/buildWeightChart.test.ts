/// <reference types="jest" />

import type { WeightPoint } from "../types";

import { buildWeightChart, MAX_CHART_POINTS } from "./buildWeightChart";

const SIZE = { width: 300, height: 56, inset: 3 };

const points = (...weights: number[]): WeightPoint[] =>
  weights.map((weightKg, index) => ({
    measuredAt: `2026-09-${String(index + 1).padStart(2, "0")}T09:00:00.000Z`,
    weightKg,
  }));

describe("buildWeightChart", () => {
  it("draws nothing for fewer than two measurements", () => {
    expect(buildWeightChart([], SIZE)).toEqual({ path: "", dots: [], scale: null });
    expect(buildWeightChart(points(4.1), SIZE)).toEqual({ path: "", dots: [], scale: null });
  });

  it("keeps the first and last dot a full inset away from the edges", () => {
    const { dots } = buildWeightChart(points(4.0, 4.5, 4.2), SIZE);

    expect(dots[0]?.x).toBe(3);
    expect(dots.at(-1)?.x).toBe(297);
  });

  it("spreads measurements evenly across the width", () => {
    const { dots } = buildWeightChart(points(4.0, 4.5, 4.2, 4.4, 4.1), SIZE);
    const gaps = dots.slice(1).map((dot, index) => dot.x - (dots[index]?.x ?? 0));

    expect(new Set(gaps.map((gap) => gap.toFixed(6))).size).toBe(1);
  });

  it("puts a heavier weight higher on the screen", () => {
    const { dots } = buildWeightChart(points(4.0, 5.0), SIZE);

    expect(dots[1]?.y).toBeLessThan(dots[0]?.y ?? 0);
  });

  it("uses the whole usable height for a real change", () => {
    const { dots } = buildWeightChart(points(3.0, 5.0), SIZE);

    expect(dots[1]?.y).toBeCloseTo(3, 5);
    expect(dots[0]?.y).toBeCloseTo(53, 5);
  });

  it("draws a flat history as a flat line through the middle", () => {
    const { dots } = buildWeightChart(points(4.1, 4.1, 4.1), SIZE);

    expect(dots.every((dot) => dot.y === 28)).toBe(true);
  });

  it("does not blow a tiny wobble up into a cliff", () => {
    const { dots } = buildWeightChart(points(4.1, 4.15), SIZE);
    const travelled = Math.abs((dots[1]?.y ?? 0) - (dots[0]?.y ?? 0));

    expect(travelled).toBeLessThan(SIZE.height / 2);
  });

  it("keeps only the newest measurements", () => {
    const many = points(...Array.from({ length: MAX_CHART_POINTS + 5 }, (_, i) => 4 + i * 0.01));

    expect(buildWeightChart(many, SIZE).dots).toHaveLength(MAX_CHART_POINTS);
  });

  it("joins the dots with a single connected path", () => {
    const { path, dots } = buildWeightChart(points(4.0, 4.5, 4.2), SIZE);

    expect(path.startsWith(`M${dots[0]?.x} ${dots[0]?.y}`)).toBe(true);
    expect(path.match(/L/g)).toHaveLength(dots.length - 1);
  });

  it("draws more than the default window when asked to", () => {
    const many = points(...Array.from({ length: 20 }, (_, i) => 4 + i * 0.01));

    expect(buildWeightChart(many, { ...SIZE, maxPoints: 20 }).dots).toHaveLength(20);
  });

  it("reports the weights at the edges of the drawn area, so axis labels match the line", () => {
    const { dots, scale } = buildWeightChart(points(3.0, 5.0), SIZE);

    expect(scale?.min).toBeLessThan(3.0);
    expect(scale?.max).toBeGreaterThan(5.0);
    expect(dots[1]?.y).toBeLessThan(dots[0]?.y ?? 0);
    expect((scale?.min ?? 0) + (scale?.max ?? 0)).toBeCloseTo(8.0, 5);
  });
});
