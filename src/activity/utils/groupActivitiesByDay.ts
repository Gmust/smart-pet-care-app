import dayjs from "dayjs";

import type { ActivityLogResponseDto } from "@/api/generated";

import type { ActivityListRow } from "../types";

/**
 * Flattens activity logs into the header/activity row list the virtualized
 * FlatList renders, newest day first and newest entry first within each day.
 *
 * `recordedAt` is UTC; days are local calendar days, which is what an owner
 * means by "yesterday". Entries with no `recordedAt` are dropped — they cannot
 * be placed on a day.
 */
export const groupActivitiesByDay = (
  activities: ActivityLogResponseDto[] | undefined
): ActivityListRow[] => {
  const byDay = new Map<string, ActivityLogResponseDto[]>();

  for (const activity of activities ?? []) {
    if (!activity.recordedAt) continue;
    const dayIso = dayjs(activity.recordedAt).startOf("day").toISOString();
    const existing = byDay.get(dayIso);
    if (existing) {
      existing.push(activity);
    } else {
      byDay.set(dayIso, [activity]);
    }
  }

  const rows: ActivityListRow[] = [];

  for (const dayIso of [...byDay.keys()].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))) {
    rows.push({ kind: "header", key: `header-${dayIso}`, dayIso });

    const dayActivities = (byDay.get(dayIso) ?? []).sort(
      (a, b) => dayjs(b.recordedAt).valueOf() - dayjs(a.recordedAt).valueOf()
    );

    for (const activity of dayActivities) {
      rows.push({
        kind: "activity",
        key: `activity-${activity.id ?? `${dayIso}-${rows.length}`}`,
        activity,
      });
    }
  }

  return rows;
};
