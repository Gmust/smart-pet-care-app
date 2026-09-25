import { ClassifierWellnessReasonCode } from "@/api/generated";

/** Fixed slots of WellnessStatesDto, in the order they are shown on the detail screen. */
export const WELLNESS_STATE_KEYS = [
  "activity",
  "sleep",
  "diet",
  "symptoms",
  "preventiveCare",
  "baseline",
] as const;

export type WellnessStateKey = (typeof WELLNESS_STATE_KEYS)[number];

/** The three slots the home card has room for. */
export const WELLNESS_CARD_STATE_KEYS = ["activity", "diet", "symptoms"] as const;

// Reason codes that read as "nothing to do here". Everything else — missing
// data, below target, classifier failures, reported symptoms — is surfaced as
// needing attention, so a gap in tracking is never shown as a healthy signal.
const OK_REASON_CODES: ReadonlySet<ClassifierWellnessReasonCode> = new Set([
  ClassifierWellnessReasonCode.ACTIVITY_TARGET_MET,
  ClassifierWellnessReasonCode.ACTIVITY_NOT_APPLICABLE,
  ClassifierWellnessReasonCode.SLEEP_WITHIN_RANGE,
  ClassifierWellnessReasonCode.SLEEP_NOT_APPLICABLE,
  ClassifierWellnessReasonCode.DIET_TRACKING_STRONG,
  ClassifierWellnessReasonCode.SYMPTOMS_NOT_REPORTED,
  ClassifierWellnessReasonCode.PREVENTIVE_CARE_CURRENT,
  ClassifierWellnessReasonCode.BASELINE_STABLE,
]);

export const isWellnessStateOk = (code: ClassifierWellnessReasonCode) => OK_REASON_CODES.has(code);
