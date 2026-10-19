/// <reference types="jest" />

import { FoodType, ReminderType } from "@/api/generated";

import type { FeedingListRow } from "../types";

import { groupFeedingRowsByDay } from "./groupFeedingRowsByDay";

// Timestamps are UTC but days are local calendar days, so these cases are
// timezone-sensitive by nature. TZ is pinned to UTC in jest.config.js — setting
// it here would be too late, Node resolves the local timezone before this runs.

const logRow = (id: string, fedAt: string): FeedingListRow => ({
  kind: "log",
  key: `log-${id}`,
  log: {
    id,
    petId: "pet-1",
    fedAt,
    foodType: FoodType.DryFood,
    createdAt: fedAt,
  },
});

const scheduledRow = (scheduledFor: string): FeedingListRow => ({
  kind: "scheduled",
  key: `occurrence-${scheduledFor}`,
  occurrence: {
    reminderId: "rem-1",
    petId: "pet-1",
    type: ReminderType.Feeding,
    scheduledFor,
  },
});

describe("groupFeedingRowsByDay", () => {
  it("returns no sections for no rows", () => {
    expect(groupFeedingRowsByDay([])).toEqual([]);
  });

  it("puts a day's rows under one section", () => {
    const sections = groupFeedingRowsByDay([
      logRow("breakfast", "2026-10-08T08:05:00.000Z"),
      logRow("dinner", "2026-10-08T18:00:00.000Z"),
    ]);

    expect(sections).toHaveLength(1);
    expect(sections[0].rows).toHaveLength(2);
  });

  it("orders days newest first", () => {
    const sections = groupFeedingRowsByDay([
      logRow("older", "2026-10-06T08:00:00.000Z"),
      logRow("newer", "2026-10-08T08:00:00.000Z"),
    ]);

    expect(sections.map((section) => section.dayIso)).toEqual([
      "2026-10-08T00:00:00.000Z",
      "2026-10-06T00:00:00.000Z",
    ]);
  });

  it("keeps the incoming order inside a day", () => {
    const sections = groupFeedingRowsByDay([
      logRow("breakfast", "2026-10-08T08:05:00.000Z"),
      logRow("dinner", "2026-10-08T18:00:00.000Z"),
    ]);

    expect(sections[0].rows.map((row) => row.kind === "log" && row.log.id)).toEqual([
      "breakfast",
      "dinner",
    ]);
  });

  it("groups scheduled slots alongside logs", () => {
    const sections = groupFeedingRowsByDay([
      logRow("breakfast", "2026-10-08T08:05:00.000Z"),
      scheduledRow("2026-10-08T18:00:00.000Z"),
    ]);

    expect(sections).toHaveLength(1);
    expect(sections[0].rows.map((row) => row.kind)).toEqual(["log", "scheduled"]);
  });

  it("splits rows that fall on different days", () => {
    const sections = groupFeedingRowsByDay([
      logRow("late", "2026-10-07T23:30:00.000Z"),
      logRow("early", "2026-10-08T00:30:00.000Z"),
    ]);

    expect(sections).toHaveLength(2);
  });

  it("skips a row whose timestamp is not a date", () => {
    const sections = groupFeedingRowsByDay([
      logRow("broken", "not-a-date"),
      logRow("ok", "2026-10-08T08:05:00.000Z"),
    ]);

    expect(sections).toHaveLength(1);
    expect(sections[0].rows).toHaveLength(1);
  });
});
