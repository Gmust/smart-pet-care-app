import type { HealthRecordResponseDto } from "@/api/generated";

import dayjs from "dayjs";

export type HealthRecordYearGroup = {
  year: number;
  records: HealthRecordResponseDto[];
};

export function groupHealthRecordsByYear(
  records: HealthRecordResponseDto[]
): HealthRecordYearGroup[] {
  const byYear = new Map<number, HealthRecordResponseDto[]>();

  for (const record of records) {
    const year = dayjs(record.performedAt).year();
    const bucket = byYear.get(year) ?? [];
    bucket.push(record);
    byYear.set(year, bucket);
  }

  return Array.from(byYear.entries())
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, yearRecords]) => ({
      year,
      records: [...yearRecords].sort(
        (a, b) => dayjs(b.performedAt).valueOf() - dayjs(a.performedAt).valueOf()
      ),
    }));
}
