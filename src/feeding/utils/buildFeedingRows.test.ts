/// <reference types="jest" />

import type { FeedingLogResponseDto, ReminderOccurrenceDto } from "@/api/generated";
import { FoodType, ReminderType } from "@/api/generated";

import { buildFeedingRows } from "./buildFeedingRows";

const log = (id: string, fedAt: string): FeedingLogResponseDto => ({
  id,
  petId: "pet-1",
  fedAt,
  foodType: FoodType.DryFood,
  createdAt: fedAt,
});

const occurrence = (
  scheduledFor: string,
  overrides: Partial<ReminderOccurrenceDto> = {}
): ReminderOccurrenceDto => ({
  reminderId: `rem-${scheduledFor}`,
  petId: "pet-1",
  title: "Dinner",
  type: ReminderType.Feeding,
  scheduledFor,
  isMaterialized: true,
  isOverdue: false,
  ...overrides,
});

// Every slot in these cases is on 2026-10-08, so this clock keeps them upcoming
// unless a case moves it.
const BEFORE_SLOTS = new Date("2026-10-08T00:00:00.000Z");

const build = (
  logs: FeedingLogResponseDto[] | undefined,
  occurrences: ReminderOccurrenceDto[] | undefined,
  now: Date = BEFORE_SLOTS
) => buildFeedingRows(logs, occurrences, now);

describe("buildFeedingRows", () => {
  describe("telling an upcoming slot from a missed one", () => {
    it("treats a slot whose time has passed as missed, though the server says it is not overdue", () => {
      const rows = build(
        [],
        [occurrence("2026-10-08T08:30:00.000Z", { isOverdue: false })],
        new Date("2026-10-08T23:00:00.000Z")
      );

      expect(rows.map((row) => row.kind)).toEqual(["missed"]);
    });

    it("keeps a slot that is still ahead as scheduled", () => {
      const rows = build(
        [],
        [occurrence("2026-10-08T20:30:00.000Z")],
        new Date("2026-10-08T08:00:00.000Z")
      );

      expect(rows.map((row) => row.kind)).toEqual(["scheduled"]);
    });

    it("hides a slot whose meal was logged against its reminder, even once its time has passed", () => {
      const rows = build(
        [{ ...log("early", "2026-10-08T02:00:00.000Z"), reminderId: "breakfast" }],
        [occurrence("2026-10-08T08:30:00.000Z", { reminderId: "breakfast" })],
        new Date("2026-10-08T23:00:00.000Z")
      );

      expect(rows.map((row) => row.kind)).toEqual(["log"]);
    });
  });

  it("returns nothing for empty and undefined input", () => {
    expect(build([], [])).toEqual([]);
    expect(build(undefined, undefined)).toEqual([]);
  });

  it("orders a day oldest first, the way a day reads", () => {
    const rows = build(
      [log("dinner", "2026-10-08T18:00:00.000Z"), log("breakfast", "2026-10-08T08:05:00.000Z")],
      []
    );

    expect(rows.map((row) => row.kind === "log" && row.log.id)).toEqual(["breakfast", "dinner"]);
  });

  it("interleaves scheduled slots with logged meals by time", () => {
    const rows = build(
      [log("breakfast", "2026-10-08T08:05:00.000Z")],
      [occurrence("2026-10-08T18:00:00.000Z")]
    );

    expect(rows.map((row) => row.kind)).toEqual(["log", "scheduled"]);
  });

  it("marks an overdue slot as missed, using the server's flag", () => {
    const rows = build([], [occurrence("2026-10-08T18:00:00.000Z", { isOverdue: true })]);

    expect(rows.map((row) => row.kind)).toEqual(["missed"]);
  });

  it("drops a completed slot so the meal is not counted twice", () => {
    const rows = build(
      [log("dinner", "2026-10-08T18:02:00.000Z")],
      [
        occurrence("2026-10-08T18:00:00.000Z", {
          completedAt: "2026-10-08T18:02:00.000Z",
          isOverdue: true,
        }),
      ]
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe("log");
  });

  describe("an upcoming slot whose meal was logged early", () => {
    const logFor = (reminderId: string, fedAt: string): FeedingLogResponseDto => ({
      ...log("early", fedAt),
      reminderId,
    });
    const completion = (reminderId: string, performedAt: string) =>
      occurrence(performedAt, { reminderId, completedAt: performedAt, performedAt });

    it("is hidden while the log tied to its reminder exists that day", () => {
      const rows = build(
        [logFor("breakfast", "2026-10-08T02:00:00.000Z")],
        [
          completion("breakfast", "2026-10-08T02:00:00.000Z"),
          occurrence("2026-10-08T08:30:00.000Z", { reminderId: "breakfast" }),
        ]
      );

      expect(rows.map((row) => row.kind)).toEqual(["log"]);
    });

    it("comes back when that log is deleted, though the completion stays", () => {
      const rows = build(
        [],
        [
          completion("breakfast", "2026-10-08T02:00:00.000Z"),
          occurrence("2026-10-08T08:30:00.000Z", { reminderId: "breakfast" }),
        ]
      );

      expect(rows.map((row) => row.kind)).toEqual(["scheduled"]);
    });

    it("stays when the log belongs to another reminder", () => {
      const rows = build(
        [logFor("dinner", "2026-10-08T02:00:00.000Z")],
        [occurrence("2026-10-08T08:30:00.000Z", { reminderId: "breakfast" })]
      );

      expect(rows.map((row) => row.kind)).toEqual(["log", "scheduled"]);
    });

    it("stays when the log was on another day", () => {
      const rows = build(
        [logFor("breakfast", "2026-10-07T08:00:00.000Z")],
        [occurrence("2026-10-08T08:30:00.000Z", { reminderId: "breakfast" })]
      );

      expect(rows.map((row) => row.kind)).toEqual(["log", "scheduled"]);
    });
  });

  it("ignores occurrences of other reminder types", () => {
    const rows = build(
      [],
      [occurrence("2026-10-08T09:00:00.000Z", { type: ReminderType.Medication })]
    );

    expect(rows).toEqual([]);
  });

  it("drops entries that cannot be placed on a day", () => {
    const undated = { ...log("x", ""), fedAt: "" };

    expect(build([undated], [])).toEqual([]);
    expect(build([], [occurrence("not-a-date")])).toEqual([]);
  });

  it("gives scheduled rows a key that survives a null runId", () => {
    const rows = build([], [occurrence("2026-10-08T18:00:00.000Z", { runId: null })]);

    expect(rows[0].key).toBe("occurrence-rem-2026-10-08T18:00:00.000Z-2026-10-08T18:00:00.000Z");
  });
});
