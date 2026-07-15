const emergencyIndicators = [
  "cannot breathe",
  "can't breathe",
  "not breathing",
  "unconscious",
  "seizure",
  "severe bleeding",
  "poison",
];

export const normalizeAssistantInput = (value: string): string =>
  value.trim().toLocaleLowerCase("en").replace(/\s+/g, " ");

export const hasEmergencyIndicator = (value: string): boolean => {
  const normalized = normalizeAssistantInput(value);
  return emergencyIndicators.some((indicator) => normalized.includes(indicator));
};
