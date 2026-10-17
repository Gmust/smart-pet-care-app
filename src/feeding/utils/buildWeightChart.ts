import type { WeightPoint } from "../types";

export const MAX_CHART_POINTS = 12;

// The vertical scale never covers less than this share of the average weight, so 4.10 to 4.15 kg
// does not draw as a cliff.
const MIN_SPAN_RATIO = 0.1;

type Size = {
  width: number;
  height: number;
  inset: number;
  maxPoints?: number;
};

export type WeightChart = {
  path: string;
  dots: { x: number; y: number }[];
  scale: { min: number; max: number } | null;
};

const EMPTY_CHART: WeightChart = { path: "", dots: [], scale: null };

export const buildWeightChart = (
  points: WeightPoint[],
  { width, height, inset, maxPoints = MAX_CHART_POINTS }: Size
) => {
  const recent = points.slice(-maxPoints);
  if (recent.length < 2) return EMPTY_CHART;

  const weights = recent.map((point) => point.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const mean = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;

  const span = Math.max(max - min, mean * MIN_SPAN_RATIO);
  const middle = (min + max) / 2;
  const usableWidth = width - inset * 2;
  const usableHeight = height - inset * 2;

  const dots = recent.map((point, index) => ({
    x: inset + (usableWidth * index) / (recent.length - 1),
    y: height / 2 - ((point.weightKg - middle) / span) * usableHeight,
  }));

  const path = dots.map((dot, index) => `${index === 0 ? "M" : "L"}${dot.x} ${dot.y}`).join(" ");

  const halfScale = (span * height) / (usableHeight * 2);

  return {
    path,
    dots,
    scale: { min: middle - halfScale, max: middle + halfScale },
  } satisfies WeightChart;
};
