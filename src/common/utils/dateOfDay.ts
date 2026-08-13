export function parseDateOfDay(value: string): Date {
  const date = new Date();
  const [year, month, day] = value.split("-").map(Number);
  if (![year, month, day].some(Number.isNaN)) {
    date.setFullYear(year, month - 1, day);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDateOfDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
