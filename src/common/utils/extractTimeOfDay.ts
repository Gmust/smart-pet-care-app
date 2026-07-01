export const extractTimeOfDay = (timeOfDay?: string): string | undefined => {
  const match = timeOfDay?.match(/(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
};
