import dayjs from "dayjs";

import type { FeedingDaySection, FeedingListRow } from "../types";

// Timestamps are UTC but days are local calendar days.
export const groupFeedingRowsByDay = (rows: FeedingListRow[]): FeedingDaySection[] => {
  const byDay = new Map<string, FeedingListRow[]>();

  for (const row of rows) {
    const iso = row.kind === "log" ? row.log.fedAt : row.occurrence.scheduledFor;
    if (!iso || !dayjs(iso).isValid()) continue;

    const dayIso = dayjs(iso).startOf("day").toISOString();
    const existing = byDay.get(dayIso);
    if (existing) {
      existing.push(row);
    } else {
      byDay.set(dayIso, [row]);
    }
  }

  return [...byDay.keys()]
    .sort((left, right) => (left < right ? 1 : left > right ? -1 : 0))
    .map((dayIso) => ({
      key: `day-${dayIso}`,
      dayIso,
      rows: byDay.get(dayIso) ?? [],
    }));
};
