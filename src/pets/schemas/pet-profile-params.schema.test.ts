/// <reference types="jest" />

import { petProfileParamsSchema } from "./pet-profile-params.schema";

const PET_ID = "2464cb42-30db-4bbd-9bb6-9523f20fa329";

describe("petProfileParamsSchema", () => {
  it("opens on the requested tab", () => {
    const parsed = petProfileParamsSchema.parse({ petId: PET_ID, tab: "reminders" });

    expect(parsed.tab).toBe("reminders");
  });

  it("has no tab when none is asked for", () => {
    expect(petProfileParamsSchema.parse({ petId: PET_ID }).tab).toBeUndefined();
  });

  it("ignores an unknown tab instead of rejecting the whole link", () => {
    const result = petProfileParamsSchema.safeParse({ petId: PET_ID, tab: "nonsense" });

    expect(result.success).toBe(true);
    expect(result.data?.tab).toBeUndefined();
  });

  it("still rejects an id that is not a uuid, whatever the tab", () => {
    expect(petProfileParamsSchema.safeParse({ petId: "nope", tab: "reminders" }).success).toBe(
      false
    );
  });

  it("keeps where the screen was opened from, and ignores an unknown origin", () => {
    expect(petProfileParamsSchema.parse({ petId: PET_ID, from: "home" }).from).toBe("home");

    const result = petProfileParamsSchema.safeParse({ petId: PET_ID, from: "elsewhere" });

    expect(result.success).toBe(true);
    expect(result.data?.from).toBeUndefined();
  });
});
