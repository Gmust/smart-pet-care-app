export function parseTimeOfDay(value: string): Date {
  const date = new Date();
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

export function formatTimeOfDay(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
