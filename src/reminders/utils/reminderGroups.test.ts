/// <reference types="jest" />

import type { ReminderResponseDto } from "@/api/generated";
import { ReminderStatus, ReminderType } from "@/api/generated";

import { getReminderStatus, toReminderGroups } from "./reminderGroups";

// jest.config.js pins TZ=UTC, so these instants land on the calendar days the
// assertions assume. Setting process.env.TZ from here would be too late.
const NOW = new Date("2026-09-13T20:00:00.000Z");

const reminder = (overrides: Partial<ReminderResponseDto> = {}): ReminderResponseDto => ({
  id: "reminder-1",
  title: "Morning feeding",
  type: ReminderType.Feeding,
  status: ReminderStatus.Active,
  ...overrides,
});

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("getReminderStatus", () => {
  it("reports a passed overdueSince as Missed even while the API still says Active", () => {
    // The exact shape that put one reminder under the "Active" filter while its
    // own card was badged "Missed".
    expect(
      getReminderStatus(
        reminder({
          status: ReminderStatus.Active,
          overdueSince: "2026-09-13T19:55:00.000Z",
          nextTriggerAt: "2026-09-14T19:55:00.000Z",
        })
      )
    ).toBe(ReminderStatus.Missed);
  });

  it("leaves an active reminder whose next trigger is still ahead alone", () => {
    expect(
      getReminderStatus(
        reminder({ status: ReminderStatus.Active, nextTriggerAt: "2026-09-14T19:55:00.000Z" })
      )
    ).toBe(ReminderStatus.Active);
  });

  it("never downgrades a status the API already settled", () => {
    expect(
      getReminderStatus(
        reminder({ status: ReminderStatus.Completed, nextTriggerAt: "2026-09-01T08:00:00.000Z" })
      )
    ).toBe(ReminderStatus.Completed);
  });
});

describe("toReminderGroups", () => {
  it("dates an overdue reminder by the occurrence it missed, not its next one", () => {
    // Regression: the card showed nextTriggerAt (Sep 14) beside a "Missed"
    // badge on Sep 13 — a future date presented as a failure.
    const [group] = toReminderGroups([
      reminder({
        status: ReminderStatus.Active,
        overdueSince: "2026-09-13T19:55:00.000Z",
        nextTriggerAt: "2026-09-14T19:55:00.000Z",
      }),
    ]);

    expect(group.key).toBe("overdue");
    expect(group.reminders[0].status).toBe(ReminderStatus.Missed);
    expect(group.reminders[0].time).toContain("Sep 13");
    expect(group.reminders[0].time).not.toContain("Sep 14");
  });

  it("dates a pending reminder by its next trigger", () => {
    const [group] = toReminderGroups([
      reminder({ status: ReminderStatus.Active, nextTriggerAt: "2026-09-14T19:55:00.000Z" }),
    ]);

    expect(group.key).toBe("tomorrow");
    expect(group.reminders[0].time).toContain("Sep 14");
  });

  it("buckets a reminder with no next trigger as passed", () => {
    const [group] = toReminderGroups([reminder({ status: ReminderStatus.Completed })]);

    expect(group.key).toBe("passed");
  });
});
