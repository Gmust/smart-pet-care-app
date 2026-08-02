import type { WeightUnit } from "../types";

export const GRAMS_PER_KG = 1000;

export function toGrams(value: number, unit: WeightUnit): number {
  return unit === "kg" ? value * GRAMS_PER_KG : value;
}

export function formatWeight(grams: number, unit: WeightUnit): string {
  return unit === "kg" ? (grams / GRAMS_PER_KG).toFixed(1) : String(Math.round(grams));
}
