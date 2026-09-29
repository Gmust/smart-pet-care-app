import type { WellnessResponseDto } from "@/api/generated";

/**
 * The spec types wellnessScore as `number | string | null` (int32 that may
 * arrive serialised), so every reader has to coerce. Returns null whenever
 * there is no usable number — an absent score is a real state, not a zero.
 */
export const parseWellnessScore = (score: WellnessResponseDto["wellnessScore"]) => {
  if (score === null || score === undefined) return null;
  // Number("") is 0, which would render an empty payload as a score of zero.
  if (typeof score === "string" && score.trim() === "") return null;
  const parsed = Number(score);
  return Number.isFinite(parsed) ? parsed : null;
};
