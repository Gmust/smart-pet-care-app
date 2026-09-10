/// <reference types="jest" />

import type { ActivityLogResponseDto } from "@/api/generated";
import { ActivityType } from "@/api/generated";

import { groupActivitiesByDay } from "./groupActivitiesByDay";

// recordedAt is UTC but grouping uses local calendar days, so these cases are
// timezone-sensitive by nature. TZ is pinned to UTC in jest.config.js — setting
// it here would be too late, Node resolves the local timezone before this runs.

const makeActivity = (
  id: string,
  recordedAt: string,
  type: ActivityType = ActivityType.Walk
): ActivityLogResponseDto => ({ id, recordedAt, type });

describe("groupActivitiesByDay", () => {
  it("returns an empty list for empty and undefined input", () => {
    expect(groupActivitiesByDay([])).toEqual([]);
    expect(groupActivitiesByDay(undefined)).toEqual([]);
  });

  it("emits one header followed by that day's entries", () => {
    const rows = groupActivitiesByDay([makeActivity("a", "2026-09-01T09:00:00.000Z")]);

    expect(rows).toHaveLength(2);
    expect(rows[0].kind).toBe("header");
    expect(rows[1].kind).toBe("activity");
  });

  it("orders days newest first", () => {
    const rows = groupActivitiesByDay([
      makeActivity("older", "2026-08-30T09:00:00.000Z"),
      makeActivity("newer", "2026-09-01T09:00:00.000Z"),
    ]);

    const headers = rows.filter((row) => row.kind === "header");
    expect(headers).toHaveLength(2);
    expect(headers[0].kind === "header" && headers[0].dayIso).toContain("2026-09-01");
    expect(headers[1].kind === "header" && headers[1].dayIso).toContain("2026-08-30");
  });

  it("orders entries newest first within a day", () => {
    const rows = groupActivitiesByDay([
      makeActivity("morning", "2026-09-01T07:00:00.000Z"),
      makeActivity("evening", "2026-09-01T19:00:00.000Z"),
    ]);

    const ids = rows
      .filter((row) => row.kind === "activity")
      .map((row) => (row.kind === "activity" ? row.activity.id : null));

    expect(ids).toEqual(["evening", "morning"]);
  });

  it("groups entries either side of local midnight into separate days", () => {
    const rows = groupActivitiesByDay([
      makeActivity("beforeMidnight", "2026-09-01T23:59:00.000Z"),
      makeActivity("afterMidnight", "2026-09-02T00:01:00.000Z"),
    ]);

    expect(rows.filter((row) => row.kind === "header")).toHaveLength(2);
  });

  it("keeps same-day entries under a single header", () => {
    const rows = groupActivitiesByDay([
      makeActivity("a", "2026-09-01T00:01:00.000Z"),
      makeActivity("b", "2026-09-01T23:59:00.000Z"),
    ]);

    expect(rows.filter((row) => row.kind === "header")).toHaveLength(1);
    expect(rows.filter((row) => row.kind === "activity")).toHaveLength(2);
  });

  it("drops entries with no recordedAt rather than placing them on a wrong day", () => {
    const rows = groupActivitiesByDay([
      { id: "no-date", type: ActivityType.Walk },
      makeActivity("dated", "2026-09-01T09:00:00.000Z"),
    ]);

    expect(rows.filter((row) => row.kind === "activity")).toHaveLength(1);
  });

  it("gives every row a unique key", () => {
    const rows = groupActivitiesByDay([
      makeActivity("a", "2026-09-01T09:00:00.000Z"),
      makeActivity("b", "2026-09-01T10:00:00.000Z"),
      makeActivity("c", "2026-08-30T10:00:00.000Z"),
    ]);

    const keys = rows.map((row) => row.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
