export function getUtcOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}
