// The API sends numbers as `number` or numeric `string`: compare parsed values, or every PATCH
// re-sends the field. Unparseable values read as null, so NaN never reaches a chart or a total.
export const toApiNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const trimmed = value.trim();
  if (trimmed === "") return null;

  // A decimal-pad types the locale's separator, so "4,5" is 4.5.
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};
