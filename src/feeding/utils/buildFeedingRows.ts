import dayjs from "dayjs";

import type { FeedingLogResponseDto, ReminderOccurrenceDto } from "@/api/generated";
import { ReminderType } from "@/api/generated";

import type { FeedingListRow } from "../types";

const rowTime = (row: FeedingListRow): number | null => {
  const iso = row.kind === "log" ? row.log.fedAt : row.occurrence.scheduledFor;
  if (!iso) return null;
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? null : time;
};

// `isOverdue` is not reliable yet (always false), so a slot whose time has passed also counts as
// missed on the device clock. Drop that check once the server fills it. A completed slot is
// dropped: its meal is already in `logs`. The server keeps the planned run open after a completion,
// so a slot is hidden by the client while a log tied to its reminder exists that day.
export const buildFeedingRows = (
  logs: FeedingLogResponseDto[] | undefined,
  occurrences: ReminderOccurrenceDto[] | undefined,
  now: Date = new Date()
): FeedingListRow[] => {
  const rows: FeedingListRow[] = [];

  for (const log of logs ?? []) {
    rows.push({ kind: "log", key: `log-${log.id ?? log.fedAt}`, log });
  }

  const feedingOccurrences = (occurrences ?? []).filter(
    (occurrence) => occurrence.type === ReminderType.Feeding
  );
  const loggedDays = new Set(
    (logs ?? [])
      .filter((log) => !!log.reminderId && !!log.fedAt)
      .map((log) => `${log.reminderId}-${dayjs(log.fedAt).format("YYYY-MM-DD")}`)
  );

  for (const occurrence of feedingOccurrences) {
    if (occurrence.completedAt) continue;
    if (
      loggedDays.has(
        `${occurrence.reminderId}-${dayjs(occurrence.scheduledFor).format("YYYY-MM-DD")}`
      )
    ) {
      continue;
    }

    rows.push({
      kind:
        occurrence.isOverdue || dayjs(occurrence.scheduledFor).isBefore(now)
          ? "missed"
          : "scheduled",
      key: `occurrence-${occurrence.reminderId}-${occurrence.scheduledFor}`,
      occurrence,
    });
  }

  return rows
    .filter((row) => rowTime(row) !== null)
    .sort((left, right) => (rowTime(left) ?? 0) - (rowTime(right) ?? 0));
};
